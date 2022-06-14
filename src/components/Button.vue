<template>
    <span class="focus:outline-none" :class="spanClass" v-tippy="tippy" v-if="disabled || hasTooltip" tabindex="0">
        <component :is="component" @click="handleClick" v-bind="componentProps">
            <fa v-if="showSpinner" :icon="['fas', 'spinner']" spin size="lg" fixed-width />
            <slot v-else />
        </component>
    </span>

    <component v-else :is="component" @click="handleClick" v-bind="componentProps">
        <fa v-if="showSpinner" :icon="['fas', 'spinner']" spin size="lg" fixed-width />
        <slot v-else />
    </component>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref } from 'vue';
import { hasPermissions, translateRequiresPermissions } from '~/plugins';

export default defineComponent({
    inheritAttrs: false,
    props: {
        color: {
            type: String,
            validator: (val: string) => ['primary', 'secondary', 'info', 'success', 'warning', 'danger'].includes(val),
        },
        permission: {
            type: [String, Array] as PropType<string | string[]>,
        },
        tooltip: {
            type: String,
        },
        tooltipPlacement: {
            type: String,
            validator: (val: string) => true, // TODO: List of allowed placements - cba writing long array rn
            default: 'bottom',
        },
        href: {
            type: String
        },
        to: {
            type: [String, Object]
        },
        type: {
            type: String,
            default: 'button'
        },
        spanClass: {
            type: [String, Array],
        },
        spinner: {
            type: Boolean,
            default: false,
        }
    },

    setup(props, context) {
        const showSpinner = ref(false);
        const hasPerms = computed(() => props.permission ? hasPermissions(props.permission) : true);

        const disabled = computed(() => {
            if (context.attrs.disabled || context.attrs.disabled === '') return true;

            return !hasPerms.value || showSpinner.value || null;
        });

        return {
            hasTooltip: computed(() => {
                return props.tooltip || props.permission;
            }),
            showSpinner,
            disabled,
            component: computed(() => {
                if (props.href) return 'a';
                if (props.to) return 'router-link';

                return 'button';
            }),
            componentProps: computed(() => {
                if (props.href || props.to) {
                    const properties: Record<string, any> = {
                        ...context.attrs,
                        class: [
                            'cursor-pointer',
                            ...(props.color ? ['btn', `btn-${props.color}`, 'inline-flex', 'items-center'] : []),
                            ...(context.attrs.class ? (context.attrs.class as string).split(' ') : []),
                        ],
                        disabled: disabled.value,
                    };

                    if (props.href) properties.href = props.href;
                    if (props.to) properties.to = props.to;

                    return properties;
                }

                return {
                    ...context.attrs,
                    type: props.type,
                    class: [
                        ...(props.color ? ['btn', `btn-${props.color}`] : []),
                        ...(context.attrs.class ? (context.attrs.class as string).split(' ') : []),
                    ],
                    disabled: disabled.value,
                };
            }),
            tippy: computed(() => {
                if (props.permission && !hasPerms.value) {
                    return [
                        translateRequiresPermissions(props.permission),
                        props.tooltipPlacement,
                        true,
                    ];
                }

                return props.tooltip ? [props.tooltip, props.tooltipPlacement] : null;
            }),

            handleClick: async (evt: MouseEvent) => {
                evt.stopImmediatePropagation();

                const clickEvt = context.attrs.onClick;
                if (typeof clickEvt !== 'function') return;

                if (props.spinner) showSpinner.value = true;
                await clickEvt(evt);
                if (props.spinner) showSpinner.value = false;
            }
        };
    }
});
</script>
