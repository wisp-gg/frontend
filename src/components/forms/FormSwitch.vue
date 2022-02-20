<template>
    <div class="flex flex-col lg:flex-row bg-primary-400 rounded-lg p-4 lg:items-center" :class="requiresMargin ? 'mb-4' : ''" @click="input = !input">
        <div class="switch" :class="input ? ['active'] : []">
            <input
                v-model="input"

                :id="id"
                type="checkbox"
                :name="name"
                :disabled="inputDisabled"
                :readonly="readonly"
            >
            <button type="button" />
        </div>

        <div class="mt-4 lg:ml-4 lg:mt-0">
            <label class="text-white opacity-50 tracking-wide uppercase block" :for="id" v-if="labelStr" @click="input = !input">
                <t :path="labelStr" />
            </label>

            <p class="text-white text-opacity-25 small mt-1" v-if="footer">
                <t :path="footer" />
            </p>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.switch {
    @apply flex items-center cursor-pointer;

    input {
        @apply hidden;
    }

    button {
        @apply relative bg-primary-600 border-none rounded-full ;

        height: 24px;
        width: 48px;
        transition: .2s ease-in-out background-color;

        &::before {
            @apply absolute block bg-white/50 rounded-full;

            content: '';
            top: -2px;
            left: -2px;
            width: 28px;
            height: 28px;
            transition: .2s ease-in-out transform, .2s ease-in-out background-color;
        }
    }
}

.switch.active {
    @apply shadow-none;

    button {
        @apply bg-primary-100 before:bg-accent-200 before:translate-x-full;
    }
}

</style>

<script lang="ts">
import { defineComponent, inject, ref, computed, watch, onBeforeMount, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: 'FormSwitch',

    emits: ['update:value'],
    props: {
        name: {
            type: String,
            required: true,
        },
        value: {
            type: Boolean,
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
        disabled: {
            type: Boolean,
        },
        readonly: {
            type: Boolean,
        }
    },

    setup(props, { emit }) {
        const { t } = useI18n();
        const input = ref(props.value || false);
        watch(() => props.value, newValue => {
            input.value = newValue;
        });

        watch(() => input.value, newValue => {
            emit('update:value', newValue);
        });

        let unregister: any;

        onBeforeMount(() => {
            unregister = inject<registerFormComponentFn | null>('registerFormComponent', null)?.({
                key: props.name,
                value: input,
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

        const inputDisabled = ref(!!props.disabled); // Copy disabled as otherwise disabled fields will behave weirdly due to ref modifying props.disabled directly.
        const labelStr = computed(() => {
            if (props.hideLabel) return null;
            if (props.label) return props.label;

            return `components.form.fields.${props.name}`;
        });

        return {
            t,
            input,
            inputDisabled,
            labelStr,
            id: computed(() => `${props.name}-switch`),
            requiresMargin: computed(() => {
                if (props.hideLabel || props.noMargin) {
                    return false;
                }

                return true;
            }),
        };
    },
});
</script>
