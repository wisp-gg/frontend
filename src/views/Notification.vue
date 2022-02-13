<template>
    <div class="p-2 pl-3" :class="`notification-${notification.type}`">
        <!-- TODO: if notification is clicked on, mark itself as read and possibly close the notification menu? -->
        <component :is="notification.url ? 'router-link' : 'div'" :to="{name: notification.url?.[0], params: notification.url?.[1]}">
            <div class="mb-1 text-white">
                <fa :icon="['fas', notification.icon]" />
                <span class="ml-1">
                    <t :path="notification.title" />
                </span>
            </div>
            <p class="text-white">
                <t :path="message" />
            </p>
            <div class="mt-1">
                <small>
                    <fa :icon="['far', 'clock']" />
                    <time class="ml-1">
                        <!-- TODO: we want some kind of refresh mechanism here to update this over time -->
                        {{ formatDateRelative(notification.createdAt) }}
                    </time>
                </small>
            </div>
        </component>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { formatDateRelative } from '~/core';
import { Notification } from '~/api/models';

export default defineComponent({
    props: {
        notification: {
            required: true,
            type: Notification,
        },
    },

    setup(props, context) {
        return {
            formatDateRelative,

            message: computed(() => {
                return ['notifications.' + props.notification.message?.[0], props.notification.message?.[1]];
            }),
        };
    },
});
</script>
