<template>
    <!-- TODO: allow discarding the alert through an "x" button -->
    <div :class="`alert alert-${type} flex`" role="alert">
        <div class="flex items-center">
            <fa :icon="['fas', icon]" />
        </div>
        <div class="flex-grow">
            <div class="flex flex-col justify-center h-full">
                <p class="text-white opacity-75 w-full">
                    <t :path="title" />
                </p>
                <ul v-if="messages">
                    <li v-for="(message, idx) of messages" :key="idx">
                        <p class="text-white opacity-50">
                            • <t :path="message" />
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        type: {
            required: true,
            type: String,
            validator: (value: string) => ['info', 'danger', 'warning', 'success', 'primary'].includes(value),
        },
        icon: {
            required: true,
            type: String,
        },
        title: {
            required: true,
            type: [String, Array],
        },
        messages: {
            type: Array,
        },
    },
});
</script>
