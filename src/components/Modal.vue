<template>
    <slot v-if="!noOpener" name="opener" :open="() => setOpen(true)">
        <v-button v-bind="$attrs" :color="openerColor" @click="setOpen(true)">
            <t :path="openerText" />
        </v-button>
    </slot>

    <teleport to="#modal-target">
        <transition name="fade">
            <div
                class="bg-black bg-opacity-40 fixed z-50 overflow-auto flex w-full inset-0"
                v-if="isOpen"
                @click.stop="onMaskMouseDown"
            >
                <div class="modal-container relative flex flex-col w-full m-auto">
                    <!-- Actual content/computed stuff (spinner) -->
                    <div class="bg-primary-500 p-3 sm:p-4 md:p-6 rounded shadow-md relative animate-fade-in-down overflow-y-scroll">
                        <div @click="setOpen(false)" class="absolute top-5 right-5 text-right mr-2 text-xl cursor-pointer">
                            <fa :icon="['fas', 'times']" />
                        </div>

                        <div v-if="title" class="border-b border-white border-opacity-10 text-white text-opacity-75 mb-3 pb-3">
                            <h1 class="text-xl">
                                <t :path="title" />
                            </h1>
                            <p v-if="description" class="text-white text-opacity-25 text-sm">
                                <t :path="description" />
                            </p>
                        </div>

                        <alerts v-if="hasAlerts" :by-key="alertKey" class="mb-3" />

                        <slot :close="(type, alert) => setOpen(false, type, alert)" />
                    </div>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<style scoped>
.modal-container {
  @apply max-w-[95%] md:max-w-[75%] lg:max-w-[50%];

  max-height: calc(100vh - 8rem);
}
</style>

<script lang="ts">
import { defineComponent, computed, watch, provide, ref } from 'vue';
import state from '~/state';
import { useWindowEvent } from '~/plugins';

export default defineComponent({
    inheritAttrs: false,

    emits: ['update:modelValue', 'open'],
    props: {
        modelValue: {
            type: Boolean,
        },
        title: {
            type: [String, Array],
        },
        description: {
            type: [String, Array],
        },
        hasAlerts: {
            type: [Boolean, String],
        },

        noOpener: {
            type: Boolean,
        },
        openerColor: {
            type: String,
            default: 'primary',
            // TODO: Const for valid types (to use both here & in v-button)
            validator: (val: string) => ['primary', 'secondary', 'info', 'success', 'warning', 'danger'].includes(val),
        },
        openerText: {
            type: [String, Array],
            default: 'generic.open_modal',
        },
    },

    setup(props, { emit }) {
        const isOpen = ref(props.modelValue || false);
        const setOpen = (open: boolean, type?: string, alert?: TranslatableMessage) => {
            isOpen.value = open;
            emit('update:modelValue', open);
            if (open) emit('open');

            if (!open && type && alert) {
                // If we don't wait for the next tick, the alert will be placed into the modal itself
                // (which in most cases auto-close), making it useless.
                setTimeout(() => {
                    state.alerts.add({
                        type,
                        title: alert,
                    });
                }, 0);
            }
        };

        watch(() => props.modelValue, (newValue: boolean) => {
            isOpen.value = newValue;
        });

        useWindowEvent('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        });

        if (props.hasAlerts) {
            const title = typeof props.title === 'object' ? props.title[0] as string : props.title;
            const alertKey = typeof props.hasAlerts === 'string' ? props.hasAlerts : title;
            if (!alertKey) throw new Error('Modal: Expected either `title` or `hasAlerts` value for alertKey.');

            provide<string>('alertKey', alertKey);
        }

        return {
            isOpen,
            setOpen,

            alertKey: computed(() => typeof props.hasAlerts === 'string' ? props.hasAlerts : props.title),
            onMaskMouseDown: (e: MouseEvent) => {
                if (e.target === e.currentTarget) setOpen(false);
            },
        };
    },
});
</script>
