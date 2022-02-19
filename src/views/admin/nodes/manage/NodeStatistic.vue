<template>
    <div class="flex" :class="color">
        <div class="w-1/4 bg-black/25 flex justify-center items-center text-white/75">
            <fa :icon="['fas', icon]" size="3x" />
        </div>
        <div class="w-full p-1">
            <div class="p-2">
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
            <div class="-mx-1 my-2 h-[2px] min-w-full bg-white/25" v-if="max">
                <div class="bg-white h-[2px]" :style="`width:${percentage}%`" />
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

            return props.value / props.max * 100;
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
                    return 'bg-red-800';
                }

                if (percentage.value > 50) {
                    return 'bg-yellow-700';
                }

                return 'bg-green-800';
            }),

            formattedValue: computed(() => format(props.value)),
            formattedMax: computed(() => format(props.max)),
        };
    }
});
</script>
