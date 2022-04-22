<template>
    <div>
        <v-form service-id="databaseHosts@update" class="flex flex-col items-start lg:flex-row lg:space-x-4">
            <container class="w-full lg:w-1/2" title="admin.database_hosts.host_details">
                <v-input name="name" footer="admin.database_hosts.name_footer" rule="required" :value="databaseHost?.name" />
                <v-input name="host" footer="admin.database_hosts.host_footer" rule="required" :value="databaseHost?.host" />
                <v-input name="port" footer="admin.database_hosts.port_footer" rule="required" type="number" :value="databaseHost?.port" />
                <v-switch name="enable_phpmyadmin" footer="admin.database_hosts.phpmyadmin_footer" :value="databaseHost?.enablePhpmyadmin" />

                <skeleton :content="16">
                    <v-model-select
                        service-id="nodes@getAll"

                        label="components.form.fields.node"
                        footer="admin.database_hosts.node_footer"
                        name="node_id"
                        label-prop="name"
                        value-prop="id"

                        :value="databaseHost?.node"
                    />
                </skeleton>
                <v-input name="phpmyadmin_url" footer="admin.database_hosts.phpmyadmin_url_footer" :value="databaseHost?.phpmyadminUrl ?? ''" />
            </container>

            <div class="w-full lg:w-1/2">
                <container class="mb-4" title="admin.database_hosts.user_details">
                    <v-input name="username" footer="admin.database_hosts.username_footer" rule="required" :value="databaseHost?.username" />
                    <v-input name="password" footer="admin.database_hosts.password_footer" type="password" />
                </container>

                <div class="bg-primary-500 p-4 rounded text-right space-x-4">
                    <skeleton :content="4">
                        <delete-database-host-modal :host="databaseHost" />
                    </skeleton>

                    <skeleton :content="8">
                        <v-submit no-margin color="primary" permission="database_host.update">
                            <t path="generic.save" />
                        </v-submit>
                    </skeleton>
                </div>
            </div>
        </v-form>

        <container no-padding class="mt-4" title="admin.database_hosts.databases">
            <list :service-id="databaseHost?.databases || []" :fields="listFields">
                <template #headers-after>
                    <th />
                </template>

                <template #field-server="{ result }">
                    <v-button v-if="result.server" :to="{ name: 'admin.management.servers.manage.databases', params: { server: result.server.id } }" permission="server_database.read" class="text-white/75">
                        {{ result.server.name }}
                    </v-button>
                </template>

                <template #fields-after="{ result }">
                    <td class="p-6 text-right">
                        <skeleton :content="6">
                            <v-button color="primary" :to="{ name: 'admin.management.servers.manage.databases', params: { server: result.server.id } }" permission="server_database.read">
                                <t path="generic.manage" />
                            </v-button>
                        </skeleton>
                    </td>
                </template>
            </list>
        </container>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import DeleteDatabaseHostModal from './DeleteDatabaseHostModal.vue';
import { state } from '~/core';

export default defineComponent({
    components: { DeleteDatabaseHostModal },
    setup() {
        return {
            databaseHost: computed(() => state.models.databaseHost),

            listFields: <ListField[]>[
                { key: 'server', skeleton: 8 },
                { key: 'name', skeleton: 12 },
                { key: 'username', skeleton: 8, features: ['code'] },
                { label: 'connections_from', key: 'remote', features: ['code'], skeleton: 8 },
            ]
        };
    },
});
</script>
