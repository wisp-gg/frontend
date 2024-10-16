<template>
    <!-- TODO(@havasu): fix padding/margins to be more consistent, also if the screen is too small it'll have the buttons overlap each other :/ -->
    <div class="my-4">
        <label class="text-white opacity-50 tracking-wide uppercase block mb-4" v-if="!hideLabel">
            <t :path="label" />
        </label>

        <div class="btn-group">
            <label class="btn" :class="input === key.toString() ? ['btn-primary'] : ['opacity-75']" v-for="(value, key) in options" :key="key">
                <input type="radio" :name="name" autocomplete="off" :value="key" @input="update" :disabled="inputDisabled">
                <t :path="`${prefix ? `${prefix}.` : ''}${value}`" />
            </label>
        </div>

        <p class="text-white text-opacity-25 small mt-2" v-if="footer">
            <t :path="footer" />
        </p>
    </div>
</template>

<style lang="scss" scoped>
input[type="radio"] {
    position: absolute;
    clip: rect(0,0,0,0);
    pointer-events: none;
}

.btn-group {
    .btn:first-child:not(:last-child) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .btn:not(:first-child):not(:last-child) {
        border-radius: 0;
    }

    .btn:last-child:not(:first-child) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .btn {
        cursor: pointer;
    }
}
</style>

<script lang="ts">
import { defineComponent, inject, ref, computed, onBeforeMount, onBeforeUnmount, watch } from 'vue';

export default defineComponent({
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: [Array, Object],
            required: true,
        },
        value: {
            type: [String, Number],
        },
        footer: {
            type: String,
        },
        prefix: {
            type: String,
        },
        hideLabel: {
            type: Boolean,
        },
    },

    setup(props) {
        const input = ref<string | null>(typeof props.value !== 'undefined' ? props.value.toString() : null);

        watch(() => props.value, newValue => {
            input.value = newValue !== 'undefined' ? newValue.toString() : null;
        });

        const inputDisabled = ref<boolean>(false);

        let unregister: any;

        onBeforeMount(() => {
            unregister = inject<registerFormComponentFn | null>('registerFormComponent', null)?.({
                key: props.name,
                value: input,
                onSubmit: state => {
                    inputDisabled.value = state;
                },
            });
        });

        onBeforeUnmount(() => {
            unregister?.();
            unregister = null;
        });

        return {
            inputDisabled,
            input,
            label: computed(() => `components.form.fields.${props.name}`),
            update: (element: InputEvent) => input.value = (element.target as HTMLInputElement).value,
        };
    },
});
</script>
