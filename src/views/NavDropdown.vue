<template>
    <li :class="open ? ['bg-primary-900'] : ['border-opacity-0']" class="border-t first:border-t-0 border-primary-500">
        <div @click="open = !open" class="flex justify-between cursor-pointer px-6 py-3">
            <p class="text-white text-opacity-75">
                <t :path="name" />
            </p>
            <p :class="active ? ['text-accent-500'] : ['text-white']">
                &bull;
            </p>
        </div>

        <div v-if="open" class="px-6 pb-3">
            <slot />
        </div>
    </li>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    props: {
        name: {
            type: [String, Array],
            required: true,
        },
        active: {
            type: Boolean,
            default: false,
        }
    },
    setup(props) {
        const open = ref(props.active);

        return {
            open
        };
    }
});
</script>
