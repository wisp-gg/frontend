<template>
    <div class="p-2 pl-3" :class="`notification-${notification.type}`">
        <!-- TODO: if notification is clicked on, mark itself as read and possibly close the notification menu? -->
        <component :is="url ? 'router-link' : 'div'" :to="{name: url?.[0], params: url?.[1]}">
            <div class="mb-1 text-white">
                <fa :icon="['fas', notification.icon]" />
                <span class="ml-1">
                    <t :path="title" />
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
import { useRouter } from 'vue-router';
import { formatDateRelative } from '~/core';
import { Notification } from '~/api/models';

export default defineComponent({
    props: {
        notification: {
            required: true,
            type: Notification,
        },
    },

    setup(props) {
        const router = useRouter();

        return {
            formatDateRelative,

            url: computed(() => {
                if (!props.notification.url) return;

                try { // If any notification has an invalid url, the frontend is completely bricked unless you read notifications via api - this avoids that.
                    router.resolve({
                        name: props.notification.url[0],
                        params: props.notification.url[1]
                    });
                } catch {
                    return;
                }

                return props.notification.url;
            }),

            title: computed(() => {
                if (props.notification.title?.[0] === '_raw') return props.notification.title;

                return ['notifications.' + props.notification.title?.[0], props.notification.title?.[1]];
            }),
            message: computed(() => {
                if (props.notification.message?.[0] === '_raw') return props.notification.message;

                return ['notifications.' + props.notification.message?.[0], props.notification.message?.[1]];
            }),
        };
    },
});
</script>
