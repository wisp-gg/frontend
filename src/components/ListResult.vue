<template>
    <code
        v-if="field.features?.includes('secret') && !secretOpen"
        v-tippy="'generic.click_to_reveal'"
        @click="openSecret()"
        class="cursor-pointer break-words"
    >
        {{ '•'.repeat(10) }}
    </code>

    <component
        v-else-if="formattedValue[0] !== null"
        v-bind="$attrs"

        :is="fieldElement"

        v-tippy="formattedValue[1]"
        v-clipboard="field.features?.includes('clipboard') ? formattedValue[0] : null"
        class="break-words"
    >
        {{ formattedValue[0] }}
    </component>
</template>


<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatDate, formatDateAbsolute } from '~/core/lang';
import { bytesToString } from '~/helpers';

export default defineComponent({
    inheritAttrs: false,

    props: {
        field: {
            type: Object as () => ListField,
            required: true,
        },

        value: {
            validator: () => true,
        }
    },

    setup(props) {
        const { t } = useI18n();

        const formatters: Record<SupportedListFormats, (value: any) => [any, any?]> = {
            'none': value => [value],
            'datetime': (value?: string) => {
                if (!value) return [''];

                return [
                    formatDate(value, 'L LT'),
                    [formatDateAbsolute(props.value as string, 'LLLL'), 'bottom-start', true]
                ];
            },
            'size': (value: number) => {
                value = value * (props.field.multiplier ?? 1);

                const [amount, unit] = bytesToString(value);

                return [`${amount} ${t(`generic.units.${unit}`)}`];
            },
            'number': (value: number) => {
                // TODO: Shorthand for normal value, full number in tooltip (2nd array arg)
                return [Intl.NumberFormat().format(value)];
            },
        };

        const secretOpen = ref(false);

        return {
            secretOpen,

            fieldElement: computed(() => props.field.features?.includes('code') ? 'code' : 'p'),
            formattedValue: computed(() => formatters[props.field.format || 'none'](props.value)),

            openSecret: () => {
                secretOpen.value = true;

                setTimeout(() => {
                    secretOpen.value = false;
                }, 10000);
            },
        };
    },
});
</script>
