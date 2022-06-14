<template>
    <div :class="requiresMargin ? 'mb-4' : ''">
        <label class="text-white opacity-50 tracking-wide uppercase block mb-3" :for="id" v-if="labelStr">
            <t :path="labelStr" />
        </label>

        <multiselect
            v-model="input"
            ref="multiSelectRef"
            :class="mode === 'tags' ? ['multiselect-multiple'] : ['multiselect-single']"

            :id="id"
            :mode="mode"
            :options="fixedOptions"
            :label="labelProp"
            :value-prop="valueProp"
            :track-by="labelProp"
            :create-tag="taggable"

            :searchable="isSearchable"
            :filterResults="typeof options !== 'function'"
            :min-chars="0"
            :resolve-on-load="true"
            :delay="300"

            :groups="useGroups"
            :group-label="groupLabelProp"
            :group-options="groupOptionsProp"
            :group-hide-empty="true"

            :can-deselect="!isRequired"
            :can-clear="!isRequired"
            :placeholder="placeholder ? t(placeholder) : ''"
            :disabled="inputDisabled"
            @change="change"
            @open="open = true"
            @close="open = false"
        >
            <template #caret>
                <fa :icon="['fas', 'arrow-down']" class="cursor-pointer" />
            </template>

            <template #clear="{ clear }">
                <fa v-if="!isRequired" :icon="['fas', 'times']" @click.prevent @mousedown.prevent.stop="clear" class="cursor-pointer mr-2" />
            </template>

            <template #spinner>
                <div class="flex w-full justify-end mr-4 text-accent-300">
                    <fa :icon="['fas', 'spinner']" spin />
                </div>
            </template>

            <template #tag="{ option, handleTagRemove, disabled: tagDisabled }">
                <div class="flex bg-primary-800 items-center px-2 py-1 rounded text-white text-opacity-75 text-sm cursor-text whitespace-nowrap">
                    {{ option[labelProp ?? 'label'] }}
                    <fa v-if="!tagDisabled" :icon="['fas', 'times']" @click.prevent @mousedown.prevent.stop="handleTagRemove(option, $event)" class="cursor-pointer text-base text-accent-500 ml-2" />
                </div>
            </template>

            <template #option="{ option }">
                <template v-if="noTranslate">
                    {{ option[labelProp ?? 'label'] }}
                </template>
                <t v-else :path="`${prefix ? `${prefix}.` : ''}${option[labelProp ?? 'label']}`" />
            </template>

            <template #singlelabel="iv">
                <div class="multiselect-single-label">
                    <t :path="computeIvLabel(iv)" />
                </div>
            </template>

            <!-- TODO: below needs to be tested - idk if we have any uses for this (and I doubt below is correct) -->
            <template #multiplelabel="iv">
                <div class="multiselect-multiple-label">
                    <t :path="computeIvLabel(iv)" />
                </div>
            </template>

            <template #nooptions>
                <p class="text-center py-3">
                    <t path="generic.no_results_found" />
                </p>
            </template>

            <template #noresults>
                <p class="text-center py-3">
                    <t path="generic.no_results_found" />
                </p>
            </template>
        </multiselect>

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

<style src="@vueform/multiselect/themes/default.css"></style>
<style lang="scss">
.multiselect.multiselect-single {
    @apply py-5 px-5;
}

.multiselect.multiselect-multiple {
    @apply px-5;

    padding-top: calc(1rem - 2px);
    padding-bottom: calc(1rem - 2px);
}

.multiselect {
    @apply bg-primary-400 rounded-md border-none;

    &.is-active {
        @apply shadow-none;
    }

    &.is-disabled {
        @apply bg-primary-300 opacity-30;
    }

    > svg:first-of-type {
        @apply ml-auto;
    }
}

.multiselect-dropdown {
    @apply bg-primary-800 border-primary-300 rounded-b-md border-none;
}

.multiselect-option {
    @apply flex min-h-[40px] py-2 px-3 text-white text-opacity-75 cursor-pointer;

    &.is-selected {
        @apply bg-accent-200 hover:bg-accent-500;
    }

    &.is-pointed {
        @apply bg-primary-300 text-white;
    }
}

.multiselect-single-label {
    @apply text-white/75 px-5;
}

.multiselect-group-label {
    @apply bg-primary-600 text-white text-opacity-75 py-2 px-3 text-base;
}

.multiselect-tags {
    @apply w-full flex flex-wrap gap-x-1.5 gap-y-1.5 pl-0 m-0;
}

.multiselect-search {
    @apply bg-transparent h-full;

    div svg {
        @apply ml-2;
    }
}

.multiselect-tags-search {
    @apply bg-transparent h-full;
}
</style>

<script lang="ts">
import { defineComponent, inject, ref, computed, watch, onBeforeMount, onBeforeUnmount, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Multiselect from '@vueform/multiselect';
import { Validator } from '~/core';

export default defineComponent({
    components: {
        Multiselect
    },

    emits: ['update:value'],
    props: {
        name: {
            type: String,
            required: true,
        },
        value: {
            type: [String, Array, Object, Number],
        },
        mode: {
            type: String,
            default: 'single',
            validator: (val: string) => ['single', 'tags'].includes(val),
        },
        options: { // TODO: We should handle function here and if the return is promise, then use a skeleton
            type: [Array, Object, Function],
        },
        labelProp: {
            type: String,
        },
        valueProp: {
            type: String,
        },
        max: {
            type: Number,
        },
        searchable: {
            type: Boolean,
        },
        taggable: {
            type: Boolean
        },
        placeholder: {
            type: String,
        },
        groupLabelProp: {
            type: String,
        },
        groupOptionsProp: {
            type: String,
        },
        label: {
            type: String,
        },
        hideLabel: {
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
        prefix: {
            type: String,
        },
        noTranslate: {
            type: Boolean,
        },
    },

    setup(props, { emit }) {
        if (props.mode === 'tags') {
            if (props.value && !Array.isArray(props.value)) throw new Error('v-select in tags mode however value prop was not an array.');
        }

        const { t } = useI18n();

        const multiSelectRef = ref();
        const input = ref(props.value);

        watch(() => props.value, (newValue: any) => {
            input.value = newValue;
        });

        watch(() => props.options, () => {
            multiSelectRef.value.refreshOptions();
        });

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
                value: input,
                errors: inputErrors,
                validate,
                onSubmit: state => {
                    if (props.disabled) return;

                    inputDisabled.value = state;
                },
                onSuccess: () => input.value = props.value, // Reset the state to the default
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
            multiSelectRef,
            open: ref(false),
            id: computed(() => `${props.name}-input`),
            isSearchable: computed(() => props.searchable || props.taggable),
            isRequired: computed(() => props.rule?.includes('required')),
            useGroups: computed(() => !!(props.groupLabelProp || props.groupOptionsProp)),
            requiresMargin: computed(() => {
                if (props.type === 'hidden' || props.hideLabel) {
                    return false;
                }

                return true;
            }),
            change: (val: string) => {
                input.value = val;
                emit('update:value', val);

                validate();
            },
            computeIvLabel: (data: Ref) => {
                const val = data.value[props.labelProp ?? 'label'];
                if (props.noTranslate) return ['_raw', val || 'UNKNOWN'];

                return val ? `${props.prefix ? `${props.prefix}.` : ''}${val}` : 'UNKNOWN';
            },

            // Hacky fix: seems that @vueform/multi-select assumes you pass always a function which returns a promise for searching :/
            fixedOptions: (query: string) => {
                if (typeof props.options !== 'function') return Promise.resolve(props.options);

                const output = props.options(query);
                if (output instanceof Promise) return output;

                return Promise.resolve(output);
            },
        };
    },
});
</script>
