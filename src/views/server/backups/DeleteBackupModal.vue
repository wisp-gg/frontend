<template>
    <modal has-alerts title="server.backups.delete_backup">
        <template #opener="{ open }">
            <v-button
                color="danger"
                class="py-3 px-6"
                :tooltip="backup.locked ? 'server.backups.cant_delete_locked' : 'generic.delete'"
                :disabled="backup.locked"
                permission="backup.delete"
                @click="open"
            >
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <t :path="['server.backups.delete_backup_notice', { name: backup.name }]" />

        <v-form class="mt-4" :service-id="confirm" :can-submit="canDelete">
            <v-input name="confirm_name" v-model:value="confirmNameValue" />

            <div class="text-right">
                <v-submit color="danger">
                    <t path="generic.delete" />
                </v-submit>
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import state from '~/state';
import { Backup } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        backup: {
            type: Backup,
            required: true,
        },
    },
    setup(props) {
        const confirmNameValue = ref<string>();

        return {
            confirmNameValue,

            canDelete: computed(() => confirmNameValue.value === props.backup.name),

            confirm: () => {
                return useService('backups@delete', 'server.backups.delete_backup', {
                    id: props.backup.uuidShort
                }).then(() => state.lists.refresh('backups@getAll'));
            }
        };
    }
});
</script>
