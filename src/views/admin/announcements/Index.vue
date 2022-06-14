<template>
    <container no-padding title="admin.announcements.title">
        <template #actions>
            <manage-announcement-modal />
        </template>

        <list service-id="announcements@getAll" :fields="listFields">
            <template #headers-before>
                <th />
            </template>

            <template #headers-after>
                <th />
            </template>

            <template #fields-before="{ result }">
                <td class="p-6">
                    <div class="flex justify-center">
                        <skeleton :content="4">
                            <fa :icon="['fas', result.active ? 'check' : 'times']" class="text-3xl" v-tippy="[result.active ? 'generic.enabled' : 'generic.disabled']" />
                        </skeleton>
                    </div>
                </td>
            </template>

            <template #fields-after="{ result }">
                <td class="p-6 text-right space-x-4">
                    <skeleton :content="6">
                        <v-button v-if="result.active" color="warning" permission="announcement.update" @click="resendAnnouncement(result)" spinner>
                            <t path="admin.announcements.resend" />
                        </v-button>
                    </skeleton>

                    <skeleton :content="4">
                        <manage-announcement-modal :announcement="result" />
                    </skeleton>

                    <skeleton :content="6">
                        <delete-annnouncement-modal :announcement="result" />
                    </skeleton>
                </td>
            </template>
        </list>
    </container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dispatch } from '~/core';
import { useService } from '~/plugins';
import { Announcement } from '~/api/models';
import ManageAnnouncementModal from './ManageAnnouncementModal.vue';
import DeleteAnnnouncementModal from './DeleteAnnnouncementModal.vue';

export default defineComponent({
    components: { ManageAnnouncementModal, DeleteAnnnouncementModal },
    setup() {
        return {
            resendAnnouncement: (announcement: Announcement) => useService('announcements@resend', true, { id: announcement.id })
                .then(() => dispatch('alerts/add', {
                    type: 'success',
                    title: ['admin.announcements.announcement_resent'],
                })),

            listFields: <ListField[]>[
                { key: 'text', label: 'content', skeleton: 16 },
                { key: 'createdAt', label: 'created_at', format: 'datetime', skeleton: 8 },
                { key: 'updatedAt', label: 'last_modified', format: 'datetime', skeleton: 8 },
            ],
        };
    }
});
</script>
