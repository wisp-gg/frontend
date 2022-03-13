<template>
    <div class="flex relative">
        <div class="w-full">
            <div class="p-4 flex relative z-20">
                <fa class="mr-4"  :class="color" :icon="['fas', icon]" size="2x" />
                <div>
                    <h3 class="text-white/75">
                        <t :path="`${name}`" />
                    </h3>
                    <p>
                        {{ formattedValue }}
                        <span v-if="max">
                        / {{ formattedMax }}
                    </span>
                    </p>
                </div>
            </div>
            <div class="absolute h-full min-w-full z-10 top-0 left-0" v-if="max">
                <div class="bg-primary-400 h-full" :style="`width:${percentage}%`" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { bytesToString } from '~/helpers';

export default defineComponent({
    props: {
        icon: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
        max: {
            type: Number,
        },
        unit: {
            type: String,
        },
    },

    setup(props, context) {
        const { t } = useI18n();

        const percentage = computed(() => {
            if (!props.max) return 0;

            const value = props.value / props.max * 100;

            // Clamp to 100% width to avoid going outside of the div
            // @see https://github.com/wisp-gg/frontend/issues/190
            return value > 100 ? 100 : value;
        });

        // TODO: move this to a helper to avoid duplication (e.g. with ListResult)?
        const format = (value?: number) => {
            if (value === undefined) return;

            if (props.unit === 'percentage') {
                return `${value}%`;
            } else if (props.unit === 'bytes') {
                const [amount, unit] = bytesToString(value);

                return `${amount} ${t(`generic.units.${unit}`)}`;
            }

            return value;
        };

        return {
            percentage,
            color: computed(() => {
                if (percentage.value > 80) {
                    return 'text-red-500';
                }

                if (percentage.value > 50) {
                    return 'text-yellow-700';
                }

                return 'text-green-500';
            }),

            formattedValue: computed(() => format(props.value)),
            formattedMax: computed(() => format(props.max)),
        };
    }
});
</script>
