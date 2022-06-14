<template>
    <popper :placement="placement">
        <button :class="user?.hasUnreadNotifications() ? ['badge-new'] : []" class="mx-auto relative text-lg text-white text-opacity-50 hover:text-opacity-80">
            <fa :icon="['fas', 'bell']" class="cursor-pointer" />
        </button>

        <template #content>
            <div class="bg-primary-500 min-w-[300px] rounded">
                <div class="text-opacity-75 px-3 py-2 border-b border-white/10">
                    <t path="generic.notifications" />
                </div>

                <div class="overflow-y-scroll max-h-[30vh]" v-if="user?.hasUnreadNotifications()">
                    <notification v-for="(notification, idx) of user?.notifications" :notification="notification" :key="idx" />
                </div>

                <div class="text-white-75 text-center py-4" v-else>
                    <t path="generic.none" />
                </div>

                <v-button color="secondary" class="w-full !rounded-t-none" @click="readAllNotifications" spinner>
                    <t path="generic.clear_all" />
                </v-button>
            </div>
        </template>
    </popper>
</template>

<script lang="ts">
import Popper from 'vue3-popper';
import { defineComponent, computed } from 'vue';
import { state, dispatch } from '~/core';
import { useService } from '~/plugins';
import Notification from './Notification.vue';
import { NavBarPosition } from '~/api/models/User';

export default defineComponent({
    components: {
        Popper,
        Notification,
    },

    setup(props, context) {
        return {
            user: computed(() => state.user.data),
            placement: computed(() => {
                const navPreference = state.user.data?.preferences?.navbarPosition || NavBarPosition.LEFT;

                return navPreference === NavBarPosition.LEFT ? 'right-end' : 'bottom';
            }),

            readAllNotifications: () => useService('client:account@markNotificationsRead', true)
                .then(() => {
                    dispatch('user/update', {
                        update_relationships: {
                            notifications: [],
                        },
                    });
                }),
        };
    },
});
</script>
