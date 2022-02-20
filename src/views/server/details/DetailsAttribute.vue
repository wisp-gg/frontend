<template>
    <div class="w-full md:w-1/2 flex items-center">
        <div class="text-accent-500 p-4 rounded-md bg-primary-400">
            <fa :icon="['fas', icon]" fixed-width class="text-accent-500 text-2xl" />
        </div>
        <div class="flex-grow ml-3">
            <h6 class="text-white text-opacity-75 uppercase">
                <t :path="name" />
            </h6>
            <p class="text-white text-opacity-50">
                <skeleton :content="skeleton">
                    <slot>
                        {{ finalValue }}
                    </slot>
                </skeleton>
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
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
            type: [String, Number],
        },
        formatUnit: {
            type: Boolean,
        },
        skeleton: {
            type: Number,
            default: 10,
        }
    },
    setup(props) {
        const { t } = useI18n();

        return {
            finalValue: computed(() => {
                if (props.value === 0) return '∞';
                if (!props.value) return t('generic.unknown');
                if (!props.formatUnit) return props.value;
                if (typeof props.value !== 'number') throw new Error('Attempted to format bytes whilst value is not a number');

                const [value, unit] = bytesToString(props.value);
                return `${value} ${t(`generic.units.${unit}`)}`;
            }),
        };
    },
});
</script>
