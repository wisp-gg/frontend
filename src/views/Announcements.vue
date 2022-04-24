<template>
    <popper :placement="placement">
        <button :class="user?.hasUnreadAnnouncements() ? ['badge-new'] : []" class="mx-auto relative text-lg text-white text-opacity-50 hover:text-opacity-80">
            <fa :icon="['fas', 'bullhorn']" class="mx-auto cursor-pointer" />
        </button>

        <template #content>
            <div class="bg-primary-500 min-w-[300px] rounded">
                <div class="text-opacity-75 px-3 py-2 border-b border-white/10">
                    <t path="generic.announcements" />
                </div>

                <div class="overflow-y-scroll max-h-[30vh]" v-if="user?.hasUnreadAnnouncements()">
                    <announcement v-for="(announcement, idx) of user?.announcements" :announcement="announcement" :key="idx "/>
                </div>

                <div class="text-white-75 text-center py-4" v-else>
                    <t path="generic.none" />
                </div>

                <v-button color="secondary" class="w-full !rounded-t-none" @click="readAllAnnouncements">
                    <t path="generic.clear_all" />
                </v-button>
            </div>
        </template>
    </popper>
</template>

<script lang="ts">
import Popper from 'vue3-popper';
import { computed, defineComponent } from 'vue';
import state from '~/state';
import { useService } from '~/plugins';
import Announcement from './Announcement.vue';
import { NavBarPosition } from '~/api/models/User';

export default defineComponent({
    components: {
        Popper,
        Announcement,
    },

    setup(props, context) {
        return {
            user: computed(() => state.user.data),
            placement: computed(() => {
                const navPreference = state.user.data?.preferences?.navbarPosition || NavBarPosition.LEFT;

                return navPreference === NavBarPosition.LEFT ? 'right-end' : 'bottom';
            }),

            readAllAnnouncements: () => {
                useService('client:account@markAnnouncementsRead', true)
                    .then(() => {
                        state.user.update({
                            update_relationships: {
                                announcements: [],
                            },
                        });
                    });
            },
        };
    },
});
</script>
