<template>
    <div>
        <div class="bg-primary-400 p-4 flex justify-between" :class="[toggled ? ['rounded-t-lg'] : ['rounded-lg'], !alwaysOpen ? ['cursor-pointer'] : []]" @click="toggle">
            <p>
                <t :path="name" />
            </p>

            <div>
                <slot name="extra" />

                <fa v-if="!alwaysOpen" class="self-center" :icon="['fas', 'arrow-down']" :rotation="toggled ? 180 : null" />
            </div>
        </div>
        <div v-if="toggled" class="bg-primary-600 p-4 rounded-b-lg">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    props: {
        name: {
            type: [String, Array],
            required: true
        },
        alwaysOpen: {
            type: Boolean,
        }
    },

    setup(props) {
        const toggled = ref(props.alwaysOpen ?? false);

        return {
            toggled,
            toggle: (value?: boolean) => {
                if (props.alwaysOpen) return;

                if (typeof value === 'boolean') {
                    toggled.value = value;
                } else {
                    toggled.value = !toggled.value;
                }
            },
        };
    },
});
</script>
