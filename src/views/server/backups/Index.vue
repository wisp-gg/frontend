<template>
    <container title="server.backups.all_results" no-padding>
        <template #actions>
            <div class="text-right">
                <!-- TODO: we should wait for this to finish/indicator of being WIP -->
                <create-backup-modal />
            </div>
        </template>

        <list service-id="backups@getAll" :per-page="10" :fields="listFields">
            <template #headers-after>
                <th />
            </template>

            <template #fields-after="{ result }">
                <td class="p-6 text-right">
                    <skeleton :content="8">
                        <v-button color="primary" permission="backup.deploy" class="mr-2" @click="deploy(result)">
                            <t path="generic.deploy" />
                        </v-button>
                        <v-button color="info" permission="backup.download" class="mr-2" @click="download(result)">
                            <t path="generic.download" />
                        </v-button>
                        <v-button color="warning" permission="backup.update" class="mr-2" @click="toggleLocked(result)">
                            <t :path="`generic.${result.locked ? 'unlock' : 'lock'}`" />
                        </v-button>
                        <delete-backup-modal :backup="result" />
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
import { Backup } from '~/api/models';
import { DownloadBackupRequest } from '~/api/services/client/backups';
import CreateBackupModal from './CreateBackupModal.vue';
import DeleteBackupModal from './DeleteBackupModal.vue';

export default defineComponent({
    components: { CreateBackupModal, DeleteBackupModal },
    setup() {
        const updateList = () => dispatch('lists/refresh', 'backups@getAll');

        return {
            listFields: <ListField[]>[
                { key: 'uuidShort', label: 'id', features: ['code', 'clipboard'], skeleton: 8 },
                { key: 'name', skeleton: 12 },
                { key: 'bytes', label: 'size', format: 'size', skeleton: 8 },
                { key: 'createdAt', label: 'created_at', format: 'datetime', skeleton: 12 },
            ],
            updateList,

            deploy: (result: Backup) => {
                useService('backups@deploy', true, result);
            },
            download: (result: Backup) => {
                useService<DownloadBackupRequest>('backups@download', true, result)
                    .then(({ url }) => window.open(url));
            },
            toggleLocked: (result: Backup) => {
                useService<DownloadBackupRequest>('backups@toggleLocked', true, result)
                    .then(updateList);
            },
        };
    },
});
</script>
