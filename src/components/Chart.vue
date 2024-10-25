<template>
    <div ref="chartElement" />
</template>

<style>
    .chart-time-selector {
        color: rgba(255, 255, 255, 0.4);
        margin-right: 0.5rem;
    }

    .chart-time-selector:hover {
        color: rgba(255, 255, 255, 0.8);
    }
</style>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ApexCharts from 'apexcharts';
import { timer, useDaemonEvent } from '~/plugins';

type DataPoint = {x: number; y: number};
interface TypeConfiguration {
    title: string;
    tooltip: string;
    unit?: string;
    unitLocale?: string;
    color: string;
    decimals: number;
}

const configuration: {[key: string]: TypeConfiguration} = {
    memory: {
        title: 'generic.server.memory_usage',
        tooltip: 'generic.server.memory',
        unitLocale: 'generic.units.megabytes',
        color: '#42f5d4',
        decimals: 0
    },
    cpu: {
        title: 'generic.server.cpu_usage',
        tooltip: 'generic.server.cpu',
        unit: '%',
        color: '#429bf5',
        decimals: 2
    },
};

export default defineComponent({
    props: {
        type: {
            required: true,
            type: String,
            validator: (value: string) => !!configuration[value],
        },
        maxPoints: {
            type: Number,
            default: 6,
        },
    },

    setup(props, context) {
        const { t } = useI18n();
        const chartElement = ref<HTMLElement | undefined>();
        const data: DataPoint[] = [];

        onMounted(() => {
            if (!chartElement.value) throw new Error('Unable to initialize chart - chart element is missing?');
            if (!configuration[props.type]) throw new Error('Unable to initialize chart - type is missing configuration?');

            const configurationData = configuration[props.type];
            const dateFormat = 'hh:mm:ss';
            let currentRange = 60 * 1e3;

            // Real-time charts with ApexCharts don't allow easily purging old data that won't ever be shown,
            // but purging it before update will cause a choppy animation. As a solution, we will only purge data
            // in bulk to minimize the amount of times it'll be choppy.
            //
            // With updates every ~1 second for new data point (Docker's limitations),
            // we can store data points for at least 10 minutes without any impact before showing the choppy animation.
            // Though do note that this number will linearly scale with the amount of active graphs.
            //
            // @see https://github.com/apexcharts/apexcharts.js/issues/605
            // @see https://github.com/moby/moby/blob/7b9275c0da707b030e62c96b679a976f31f929d3/daemon/daemon.go#L1086
            const dataThreshold = 60 * 10;
            const dataStore = 60 * 6;

            // The graph will look like its streaming data constantly - though this has a caveat:
            // newest data point will always have to be delayed, as we need to know where to render the graph next
            // and consider latency. The latency threshold is the gap allowed between addPoints calls before
            // stopping the "streaming" animation of the graph.
            const latencyThreshold = 300;
            const dataPointsEvery = 1000;

            const chart = new ApexCharts(chartElement.value, {
                chart: {
                    type: 'line',
                    height: '500px',
                    foreColor: 'rgba(255, 255, 255, 0.4)',
                    stacked: false,
                    toolbar: {
                        show: true,
                        tools: {
                            download: false,
                            selection: false,
                            zoom: false,
                            zoomin: false,
                            zoomout: false,
                            pan: false,
                            reset: false,
                            customIcons: [
                                {
                                    icon: `1${t('generic.dates.minute_abbreviation')}`,
                                    index: 0,
                                    title: `1 ${t('generic.dates.minute', 1)}`,
                                    class: 'chart-time-selector',
                                    click: () => updateRange(60 * 1e3),
                                },
                                {
                                    icon: `5${t('generic.dates.minute_abbreviation')}`,
                                    index: 1,
                                    title: `5 ${t('generic.dates.minute', 5)}`,
                                    class: 'chart-time-selector',
                                    click: () => updateRange(5 * 60 * 1e3),
                                },
                            ],
                        },
                    },
                    animations: {
                        enabled: true,
                        easing: 'linear',
                        speed: 1,
                        dynamicAnimation: {
                            speed: 1,
                        },
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                grid: {
                    borderColor: '#242344',
                },
                colors: [configurationData.color],
                stroke: {
                    curve: 'smooth',
                    width: 3,
                },
                series: [
                    {
                        name: t(configurationData.tooltip),
                        data: [],
                    },
                ],
                title: {
                    text: t(configurationData.title),
                    align: 'left',
                },
                xaxis: {
                    type: 'datetime',
                    categories: [],
                    range: currentRange,

                    labels: {
                        datetimeUTC: false,
                        format: dateFormat,
                        style: {
                            colors: [...Array(7).fill('rgba(255,255,255,.5)')],
                            fontSize: '14px',
                        }
                    }
                },
                legend: {
                    position: 'top',
                    fontSize: '14px',
                    labels: {
                        colors: [...Array(2).fill('rgba(255,255,255,.5)')],
                    },
                },
                tooltip: {
                    enabled: true,
                    theme: 'dark',
                    x: {
                        show: false,
                        format: dateFormat,
                    },
                },
                yaxis: [
                    {
                        min: 0,
                        decimalsInFloat: false,
                        labels: {
                            style: {
                                color: '#42f5d4',
                                fontSize: '14px',
                            },
                            formatter: (value: number) => {
                                if (configurationData.unit) {
                                    return `${value.toFixed(configurationData.decimals)} ${configurationData.unit}`;
                                }

                                if (configurationData.unitLocale) {
                                    return `${value.toFixed(configurationData.decimals)} ${t(configurationData.unitLocale)}`;
                                }

                                return value.toFixed(0);
                            }
                        },
                    },
                ],
            });

            // ApexCharts doesn't render tooltip again when updating the data, so we will need to
            // save the latest mousemove event and emit it again (if any) to make it show again :(
            // @see https://github.com/apexcharts/apexcharts.js/issues/1772
            let latestMouseMoveEvent: MouseEvent | undefined;
            let shouldEmit = false;
            chartElement.value?.addEventListener('mouseover', () => shouldEmit = true);
            chartElement.value?.addEventListener('mousemove', e => latestMouseMoveEvent = e);
            chartElement.value?.addEventListener('mouseout', () => shouldEmit = false);

            let nextPoints: {point: DataPoint, time: number}[] = [];
            const addPoint = (x: number, y: number) => {
                nextPoints.push({
                    point: {x, y},
                    time: new Date().getTime(),
                });

                startStreaming();
            };

            let streaming = false;
            const startStreaming = () => {
                if (streaming || nextPoints.length < 2) return;
                streaming = true;

                const handleDataPoints = (points: number) => {
                    data.push(
                        ...nextPoints
                            .splice(0, points)
                            .map(a => a.point)
                    );

                    if (data.length > dataThreshold) {
                        data.splice(0, data.length - dataStore);
                    }
                };

                const animateChart = (speed: number) => {
                    chart.updateOptions({
                        chart: {
                            animations: {
                                dynamicAnimation: {
                                    speed,
                                },
                            },
                        },
                        series: [
                            {
                                data: data,
                            },
                        ],
                    }, false, speed != 1);

                    if (shouldEmit) {
                        if (latestMouseMoveEvent) (<any>chart).core?.w?.globals?.dom?.Paper?.node?.dispatchEvent(latestMouseMoveEvent);
                    }
                };

                const loop = () => {
                    const buffered = nextPoints.length;

                    let delay;
                    if (buffered > 3) { // We're significantly behind - just instantly show the points as the buffer could be huge.
                        delay = 1;
                        handleDataPoints(nextPoints.length - 3);
                    } else if(buffered > 1) { // there's 2-3 data points spare - slightly speed up to compensate for starting to be stale.
                        delay = dataPointsEvery;
                        handleDataPoints(1);
                    } else if(buffered == 1) { // there's single data point spare - this is ok but we would like to have a spare data point.
                        delay = dataPointsEvery + 50;
                        handleDataPoints(1);
                    } else { // we're too far ahead - wait as long as possible (aka +latencyThreshold).
                        delay = dataPointsEvery + latencyThreshold;
                        handleDataPoints(1);
                    }

                    animateChart(delay);
                    if (nextPoints.length > 0) {
                        timer.wait(() => loop(), delay);
                    } else {
                        streaming = false;
                    }
                };
                loop();
            };

            const updateRange = (newRange: number) => {
                currentRange = newRange;

                chart.updateOptions({
                    xaxis: {
                        range: currentRange,
                    },
                });
            };

            chart.render();

            // after the chart renders, we'll initially add a point to the graph for a smoother transition
            addPoint(Date.now(), 0);

            useDaemonEvent('server-proc', data => {
                let val: number | null = null;
                switch(props.type) {
                    case 'cpu': {
                        val = data.cpuUsed;
                        break;
                    }
                    case 'memory': {
                        val = data.memoryUsed / 1024 / 1024;
                        break;
                    }
                }

                if (val) {
                    addPoint(new Date().getTime(), val);
                }
            });
        });

        return {
            chartElement,
        };
    },
});
</script>
