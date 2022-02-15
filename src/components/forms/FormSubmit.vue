<template>
    <v-button :color="color" type="submit" :permission="permission" :disabled="!canSubmit || submitting">
        <fa v-if="submitting" :icon="['fas', 'spinner']" spin size="lg" fixed-width />
        <slot v-else>
            <t :path="label" />
        </slot>
    </v-button>
</template>

<script lang="ts">
import { defineComponent, inject, onBeforeMount, onBeforeUnmount, Ref, ref } from 'vue';

export default defineComponent({
    props: {
        color: {
            type: String,
        },
        label: {
            type: String,
        },
        permission: {
            type: [String, Array],
        },
    },

    setup() {
        const submitting = ref(false);
        let unregister: any;

        onBeforeMount(() => {
            unregister = inject<registerFormComponentFn | null>('registerFormComponent', null)?.({
                onSubmit: state => submitting.value = state,
            });
        });

        onBeforeUnmount(() => {
            unregister?.();
            unregister = null;
        });

        const canSubmit = inject<Ref<boolean> | null>('formCanSubmit', null) ?? true;

        return {
            canSubmit,
            submitting,
        };
    },
});
</script>
