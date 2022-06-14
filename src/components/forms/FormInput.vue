<template>
    <div :class="requiresMargin ? `mb-4` : ''">
        <label class="text-white opacity-50 tracking-wide uppercase block mb-3" :for="id" v-if="labelStr">
            <t :path="labelStr" />
        </label>

        <div class="flex">
            <div v-if="prefix" class="flex items-center bg-primary-400 rounded-l text-white-opacity-75 p-4 border-r border-white/10">
                <t :path="prefix" />
            </div>

            <span class="flex-grow" v-tippy="tippy" v-if="permission" tabindex="0">
                <input
                    class="input"
                    :class="[prefix ? '!rounded-l-none' : '', suffix ? '!rounded-r-none' : '']"

                    v-model="input"

                    :id="id"
                    :type="type"
                    :name="name"
                    :placeholder="placeholder ? t(placeholder) : ''"
                    :disabled="!hasPerms || inputDisabled"
                    :readonly="readonly"
                    :checked="checked"
                    @blur="change"
                    @input="emitUpdate"
                    @keydown="emitKeyDown"
                    @keyup="emitKeyUp"
                >
            </span>

            <input
                class="input"
                :class="[prefix ? '!rounded-l-none' : '', suffix ? '!rounded-r-none' : '']"

                v-model="input"

                :id="id"
                :type="type"
                :name="name"
                :placeholder="placeholder ? t(placeholder) : ''"
                :disabled="inputDisabled"
                :readonly="readonly"
                @blur="blur"
                @change="change"
                @input="emitUpdate"
                @keydown="emitKeyDown"
                @keyup="emitKeyUp"

                v-else
            >

            <div v-if="suffix" class="flex items-center bg-primary-400 rounded-r text-white-opacity-75 p-4 border-l border-white/10">
                <t :path="suffix" />
            </div>

            <slot />
        </div>


        <p class="text-white text-opacity-25 small mt-1" v-if="footer">
            <t :path="footer" />
        </p>

        <div class="text-red-700" v-if="inputErrors && !formGlobal">
            <p v-for="(error, idx) of inputErrors" :key="idx">
                <t :path="error" />
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, computed, watch, onBeforeMount, onBeforeUnmount, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { Validator } from '~/core';
import { hasPermissions, translateRequiresPermissions } from '~/plugins';

export default defineComponent({
    name: 'FormInput',

    emits: ['update:value', 'keydown', 'keyup'],
    props: {
        name: {
            type: String,
            required: true,
        },
        value: {
            type: [String, Number],
        },
        resultPrefix: {
            type: String,
        },
        placeholder: {
            type: String,
        },
        label: {
            type: [String, Array],
        },
        hideLabel: {
            type: Boolean,
        },
        prefix: {
            type: [String, Array],
        },
        suffix: {
            type: [String, Array],
        },
        noMargin: {
            type: Boolean,
        },
        footer: {
            type: String,
        },
        type: {
            type: String,
        },
        rule: {
            type: String,
        },
        disabled: {
            type: Boolean,
        },
        checked: {
            type: Boolean,
        },
        readonly: {
            type: Boolean,
        },
        permission: {
            type: [String, Array] as PropType<string | string[]>,
        },
        tooltipPlacement: {
            type: String,
            validator: (val: string) => true, // TODO: List of allowed placements - cba writing long array rn
            default: 'bottom',
        },
    },

    setup(props, { emit }) {
        const { t } = useI18n();

        const input = ref(props.value ?? '');
        const update = (newValue: any) => {
            if (newValue === undefined) return;

            input.value = newValue;
        };
        watch(() => props.value, update);

        const inputDisabled = ref(!!props.disabled); // Copy disabled as otherwise disabled fields will behave weirdly due to ref modifying props.disabled directly.
        const inputErrors = ref<null | TranslatableMessage[][]>(null);

        const labelStr = computed(() => {
            if (props.type === 'hidden' || props.hideLabel) return null;
            if (props.label) return props.label;

            return `components.form.fields.${props.name}`;
        });

        const formGlobal = inject<boolean>('formGlobal', false);
        const displayFormErrors = inject<displayFormErrorsFn | null>('displayFormErrors', null);
        const validate = () => {
            if (!props.rule) return;

            const { errors } = Validator.formValidate(props.name, input.value, props.rule, formGlobal);

            inputErrors.value = errors || [];
            displayFormErrors?.();
        };

        let unregister: any;

        onBeforeMount(() => {
            unregister = inject<registerFormComponentFn | null>('registerFormComponent', null)?.({
                key: props.name,
                value: computed(() => (props.resultPrefix || '') + input.value),
                errors: inputErrors,
                validate,
                rule: props.rule,
                onSubmit: state => {
                    if (props.disabled) return;

                    inputDisabled.value = state;
                },
            });
        });

        onBeforeUnmount(() => {
            unregister?.();
            unregister = null;
        });

        const hasPerms = computed(() => props.permission ? hasPermissions(props.permission) : true);
        return {
            t,
            input,
            labelStr,
            formGlobal,
            inputErrors,
            inputDisabled,
            id: computed(() => `${props.name}-input`),
            requiresMargin: computed(() => {
                if (props.type === 'hidden' || props.hideLabel || props.noMargin) {
                    return false;
                }

                return true;
            }),
            change: (evt: KeyboardEvent) => {
                /*
                 * Autofill on iOS triggers this event, so we need to check whether the value was changed
                 * and update it if so.
                 *
                 * @see https://github.com/wisp-gg/frontend/issues/61
                 */
                const target = evt.target as HTMLInputElement;
                if (input.value !== target.value) input.value = target.value;
            },
            blur: () => validate(),
            emitUpdate: () => emit('update:value', input.value),
            emitKeyDown: (evt: KeyboardEvent) => emit('keydown', evt),
            emitKeyUp: (evt: KeyboardEvent) => emit('keyup', evt),

            hasPerms,
            tippy: computed(() => {
                if (props.permission && !hasPerms.value) {
                    return [
                        translateRequiresPermissions(props.permission),
                        props.tooltipPlacement,
                        true,
                    ];
                }

                return null;
            }),
        };
    },
});
</script>
