<template>
    <div :class="requiresMargin ? `mb-4` : ''">
        <label class="text-white opacity-50 tracking-wide uppercase block mb-3" :for="id" v-if="labelStr">
            <t :path="labelStr" />
        </label>

        <textarea
            class="input"

            v-model="input"

            :id="id"
            :name="name"
            :rows="rows"
            :placeholder="placeholder ? t(placeholder) : ''"
            :disabled="inputDisabled"
            :readonly="readonly"
            @blur="change"
            @input="emitUpdate"
        />


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
import { defineComponent, inject, ref, computed, watch, onBeforeMount, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { Validator } from '~/core';

export default defineComponent({
    name: 'FormTextarea',

    emits: ['update:value'],
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
            type: String,
        },
        hideLabel: {
            type: Boolean,
        },
        noMargin: {
            type: Boolean,
        },
        footer: {
            type: String,
        },
        rows: {
            type: Number,
            default: 3
        },
        rule: {
            type: String,
        },
        disabled: {
            type: Boolean,
        },
        readonly: {
            type: Boolean,
        }
    },

    setup(props, { emit }) {
        const { t } = useI18n();

        const input = ref(props.value ?? '');
        watch(() => props.value, newValue => {
            if (newValue === undefined) return;

            input.value = newValue;
        });

        const inputDisabled = ref(!!props.disabled); // Copy disabled as otherwise disabled fields will behave weirdly due to ref modifying props.disabled directly.
        const inputErrors = ref<null | TranslatableMessage[][]>(null);

        const labelStr = computed(() => {
            if (props.hideLabel) return null;
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
                value: input,
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

        return {
            t,
            input,
            labelStr,
            formGlobal,
            inputErrors,
            inputDisabled,
            id: computed(() => `${props.name}-textarea`),
            requiresMargin: computed(() => {
                if (props.hideLabel || props.noMargin) {
                    return false;
                }

                return true;
            }),
            change: () => validate(),
            emitUpdate: () => emit('update:value', input.value),
        };
    },
});
</script>
