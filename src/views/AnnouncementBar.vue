<template>
    <div class="fixed left-0 right-0 w-full z-50 flex flex-col items-center px-4 space-y-2">
        <transition-group name="fade" tag="div">
            <div
                v-for="announcement in limitedAnnouncements"
                :key="announcement.id"
                class="announcement-bar fade-enter-active fade-leave-active w-full p-0.5 bg-primary-500 shadow-xl rounded-2xl my-1 border border-primary-700"
            >
                <div class="flex items-center justify-between p-2 rounded-2xl">
                    <div class="flex items-center flex-1 text-center">
                        <span :class="`w-2 h-2 rounded-full bg-${announcement.type} mr-3`" />
                        <announcement :announcement="announcement" class="text-sm font-medium text-primary-0 flex-1" />
                    </div>
                    <button @click="dismiss" class="text-lg py-0.5 px-1 ml-2 text-primary-0 hover:text-primary-50 rounded-full">
                        <fa :icon="['fas', 'times']" size="lg" />
                    </button>
                </div>
            </div>
        </transition-group>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state, dispatch } from '~/core';
import { useService } from '~/plugins';
import Announcement from './Announcement.vue';

export default defineComponent({
    components: {
        Announcement,
    },
    setup() {
        const announcementsToDisplay = computed(() => state.user.data?.announcements?.filter(a => a.displayAtTop) || []);
        const limitedAnnouncements = computed(() => announcementsToDisplay.value.slice(0, 3));

        const dismiss = async () => {
            await useService('client:account@markAnnouncementsRead', true);
            dispatch('user/update', { update_relationships: { announcements: [] } });
        };

        return {
            limitedAnnouncements,
            dismiss,
        };
    },
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>