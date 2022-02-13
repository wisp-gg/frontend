<template>
    <div class="flex flex-col lg:flex-row gap-x-4 gap-y-4">
        <div class="w-full lg:w-2/3">
            <alert type="info" icon="info-circle" title="admin.servers.databases.notice" />

            <container no-padding class="mt-4" title="admin.servers.databases.active_databases">
                <list service-id="serverDatabases@getAll" :fields="listFields">
                    <template #headers-after>
                        <th />
                    </template>

                    <template #field-host="{ result }">
                        <v-button class="text-white/75" permission="database_host.read" :to="{ name: 'admin.management.database_hosts.manage', params: { databaseHost: result.host.id } }">
                            {{ result.host.name }}
                        </v-button>
                    </template>

                    <template #fields-after="{ result }">
                        <td class="p-6 text-right">
                            <div class="flex justify-end space-x-4">
                                <skeleton :content="8">
                                    <v-button color="warning" class="py-3 px-6" permission="server_database.update" @click="rotatePassword(result.id)">
                                        <t path="generic.reset_password" />
                                    </v-button>
                                </skeleton>

                                <skeleton :content="4">
                                    <v-button color="danger" permission="server_database.delete">
                                        <t path="generic.delete" />
                                    </v-button>
                                </skeleton>
                            </div>
                        </td>
                    </template>
                </list>
            </container>
        </div>

        <container class="w-full lg:w-1/3" title="admin.servers.databases.create_database">
            <v-form service-id="serverDatabases@create">
                <skeleton :content="16">
                    <v-model-select
                        name="host"
                        service-id="databaseHosts@getAll"
                        parameter="name"

                        label-prop="name"
                        value-prop="id"

                        rule="required"
                    />
                </skeleton>

                <skeleton :content="16">
                    <v-input name="name" :prefix="['_raw', `s${server.id}_`]" footer="server.databases.name_footer" rule="required" />
                </skeleton>

                <skeleton :content="16">
                    <v-input name="connections_from" footer="server.databases.connections_from_footer" rule="required" value="%" />
                </skeleton>

                <div class="text-right">
                    <v-submit color="primary" permission="server_database.create">
                        <t path="generic.create" />
                    </v-submit>
                </div>
            </v-form>
        </container>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state, dispatch } from '~/core';
import Alert from '~/components/Alert.vue';
import { useService } from '~/plugins';

export default defineComponent({
    components: { Alert },
    setup() {
        return {
            server: computed(() => state.models.server!),

            rotatePassword: (id: number) => {
                return useService('serverDatabases@rotatePassword', true, {
                    id
                }).then(() => dispatch('lists/refresh', 'serverDatabases@getAll'));
            },

            listFields: <ListField[]>[
                { key: 'name', skeleton: 6 },
                { key: 'username', features: ['clipboard', 'code'], skeleton: 12 },
                { key: 'password', features: ['clipboard', 'code', 'secret'], skeleton: 12 },
                { label: 'connections_from', key: 'remote', features: ['code'], skeleton: 6 },
                { key: 'host', skeleton: 12 },
            ],
        };
    }
});
</script>
