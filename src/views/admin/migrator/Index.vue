<template>
    <div>
        <container title="admin.migrator.step_1">
            <alert type="info" icon="info-circle" title="admin.migrator.notice" />

            <v-form service-id="migrator@migrate" class="mt-8">
                <div class="flex flex-col lg:flex-row lg:space-x-4">
                    <div class="lg:w-1/2">
                        <v-input name="panel_url" footer="admin.migrator.panel_url_footer" rule="required" />

                        <v-input type="password" name="api_key" label="components.form.fields.application_api_key" footer="admin.migrator.api_key_footer" rule="required" />
                    </div>

                    <div class="lg:w-1/2">
                        <v-switch name="locations_node_and_game_data" label="admin.migrator.locations_node_and_game_data" footer="admin.migrator.locations_node_and_game_data_footer" />
                        <v-switch name="nests_and_eggs" label="admin.migrator.nests_and_eggs" footer="admin.migrator.nests_and_eggs_footer" />
                        <v-switch name="users" footer="admin.migrator.users_footer" />
                    </div>
                </div>

                <div class="text-right">
                    <v-submit color="primary" permission="migrator.update">
                        <t path="admin.migrator.migrate" />
                    </v-submit>
                </div>
            </v-form>
        </container>

        <container no-padding title="admin.migrator.step_2" class="my-4">
            <list service-id="migrator@getAll" :fields="listFields" :per-page="5">
                <template #headers-after>
                    <th />
                </template>

                <template #field-fqdn="{ result }">
                    {{ result.fqdn }}

                    <state-label :migration="result" />
                </template>

                <template #fields-after="{ result }">
                    <td class="p-6 text-right">
                        <skeleton :content="8">
                            <v-button v-if="!result.failed && !result.notifiedUsers && result.migratedData" color="info" permission="migrator.update" @click="notifyUsers(result)" spinner>
                                <t path="admin.migrator.notify_users" />
                            </v-button>
                        </skeleton>
                    </td>
                </template>
            </list>
        </container>

        <container title="admin.migrator.step_3">
            <p>
                <t path="admin.migrator.after_migration" />
            </p>

            <ul class="list-disc p-4">
                <li>
                    <t path="admin.migrator.db_hosts_reset" />
                </li>
                <li>
                    <t path="admin.migrator.migrated_servers_backups" />
                </li>
                <li>
                    <t path="admin.migrator.migrated_nodes_cpu" />
                </li>
                <li>
                    <t path="admin.migrator.spare_allocations_ignored" />
                </li>
            </ul>

            <p>
                <t path="admin.migrator.move_to_installing_daemon" />
            </p>
        </container>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import StateLabel from './StateLabel.vue';
import { PanelMigration } from '~/api/models';
import { useService } from '~/plugins';
import { dispatch } from '~/core';

export default defineComponent({
    components: { StateLabel },
    setup() {
        return {
            notifyUsers: (migration: PanelMigration) => useService('migrator@notify', true, {
                id: migration.id
            }).then(() => {
                migration.notifiedUsers = true;

                dispatch('alerts/add', {
                    type: 'success',
                    title: ['admin.migrator.notified_users']
                });
            }),

            listFields: <ListField[]>[
                { key: 'fqdn', skeleton: 12 },
                { label: 'migrated_at', key: 'createdAt', format: 'datetime', skeleton: 12 },
            ]
        };
    }
});
</script>
