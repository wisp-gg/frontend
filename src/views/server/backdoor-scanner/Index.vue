<template>
    <container title="server.backdoor_scanner.scan">
        <div class="mb-4">
            <alert type="warning" icon="info-circle" :title="['server.backdoor_scanner.reliability_warning']" />
        </div>

        <stepper :steps="2">
            <template #step-1="{ next }">
                <v-form :service-id="(data) => scan(data, next)">
                    <v-switch name="show_non_high_severity" footer="server.backdoor_scanner.show_non_high_severity" no-margin />

                    <div class="text-right">
                        <v-submit color="primary" label="generic.scan" />
                    </div>
                </v-form>
            </template>

            <template #step-2>
                <div v-if="results.length > 0">
                    <accordion class="mb-2" :name="['_raw', data.path]" v-for="data of results" :key="data.path">
                        <template #extra>
                            <span class="label bg-primary-100 text-white mr-2">
                                <t :path="['generic.results', data.detections.length]" />
                            </span>
                            <span class="label text-white mr-2" :class="`label-${mappedState[data.detections[0].level][0]}`">
                                <t :path="`server.backdoor_scanner.levels.${mappedState[data.detections[0].level][1]}`" />
                            </span>
                        </template>

                        <div v-for="(detection, index) of data.detections" :key="index">
                            <table class="w-full mb-4">
                                <tr class="odd:bg-primary-500 even:bg-primary-300">
                                    <td class="p-4 w-1/3">
                                        <t path="server.backdoor_scanner.detection" />
                                    </td>
                                    <td class="p-4">
                                        <t path="server.backdoor_scanner.description" />
                                    </td>
                                </tr>
                                <tr class="odd:bg-primary-500 even:bg-primary-300">
                                    <td class="p-4">
                                        <t :path="`server.backdoor_scanner.detections.${detection.name}.title`" />
                                    </td>
                                    <td class="p-4">
                                        <t :path="`server.backdoor_scanner.detections.${detection.name}.description`" />
                                    </td>
                                </tr>
                            </table>

                            <editor-preview class="mb-2" :lines="Object.values(detection.lines)" :highlight="detection.mainLine - Object.keys(detection.lines)[0]" :line-start="Number(Object.keys(detection.lines)[0])" :key="index" />
                        </div>
                    </accordion>
                </div>
                <t path="generic.no_results_found" v-else />
            </template>
        </stepper>
    </container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { triggerDaemonAction, useDaemonEvent } from '~/plugins';
import { BackdoorScannerLevel, BackdoorScannerResult } from '~/api/services/daemon/types';
import EditorPreview from '~/components/EditorPreview.vue';

const mappedState: {[status: number]: [string, string]} = {
    [BackdoorScannerLevel.LOW]: ['info', 'low'],
    [BackdoorScannerLevel.MEDIUM]: ['warning', 'medium'],
    [BackdoorScannerLevel.HIGH]: ['danger', 'high'],
    [BackdoorScannerLevel.KNOWN_BACKDOOR]: ['danger', 'known_backdoor'],
}

export default defineComponent({
    components: { EditorPreview },
    setup() {
        const results = ref<BackdoorScannerResult[]>([]);

        return {
            mappedState,
            results,

            scan: (formData: { show_non_high_severity: boolean }, next: () => void): Promise<void> => {
                return new Promise(resolve => {
                    results.value = [];

                    const unregisterResults = useDaemonEvent('backdoor-scanner-found', data => {
                        data.detections.sort((a, b) => {
                            if (a.level > b.level) return -1;
                            if (b.level > a.level) return 1;

                            return 0;
                        });

                        if (!formData.show_non_high_severity) {
                            data.detections = data.detections.filter(a => a.level >= BackdoorScannerLevel.HIGH);
                        }

                        if (data.detections.length > 0) results.value.push(data);
                    });
                    const unregisterFinish = useDaemonEvent('backdoor-scanner-finish', () => {
                        results.value.sort((a, b) => {
                            if (a.detections[0].level > b.detections[0].level) return -1;
                            if (b.detections[0].level > a.detections[0].level) return 1;

                            return 0;
                        });

                        finish();
                    });
                    const finish = () => {
                        unregisterResults();
                        unregisterFinish();

                        resolve();
                        next();
                    };

                    triggerDaemonAction('backdoor-scanner-start');
                });
            },
        };
    },
});
</script>
