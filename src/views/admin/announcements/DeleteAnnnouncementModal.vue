<template>
    <!-- TODO: confirmation-modal when -->
    <modal has-alerts title="admin.announcements.delete_announcement">
        <template #opener="{ open }">
            <v-button @click="open" v-tippy="'generic.delete'" permission="announcement.delete" color="danger" class="py-3 px-6">
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t path="admin.announcements.delete_notice" />

            <div class="text-right">
                <v-button color="danger" @click="confirm">
                    <t path="generic.delete" />
                </v-button>
            </div>
        </template>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dispatch } from '~/core';
import { Announcement } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        announcement: {
            type: Announcement,
            required: true,
        },
    },
    setup(props) {
        return {
            confirm: () => {
                return useService('announcements@delete', 'admin.announcements.delete_announcement', {
                    id: props.announcement.id
                }).then(() => dispatch('lists/refresh', 'announcements@getAll'));
            }
        };
    }
});
</script>
