<template>
    <list service-id="databaseHosts@getAll" :fields="listFields" searchable>
        <template #search-extra>
            <div class="ml-4">
                <create-database-host-modal />
            </div>
        </template>

        <template #headers-after>
            <th />
        </template>

        <template #field-name="{ result }">
            <v-button :to="{ name: 'admin.management.database_hosts.manage', params: { databaseHost: result.id } }" permission="database_host.read" class="text-white/75">
                {{ result.name }}
            </v-button>
        </template>

        <template #field-databases="{ result }">
            0 / {{ result.maxDatabases ?? '∞' }}
        </template>

        <template #field-node="{ result }">
            <v-button v-if="result.node" :to="{ name: 'admin.management.nodes.manage.about', params: { node: result.node.id } }" permission="node.read" class="text-white/75">
                {{ result.node.name }}
            </v-button>
        </template>

        <template #fields-after="{ result }">
            <td class="p-6 text-right space-x-4">
                <skeleton :content="6">
                    <v-button color="primary" permission="database_host.read" :to="{ name: 'admin.management.database_hosts.manage', params: { databaseHost: result.id } }">
                        <t path="generic.manage" />
                    </v-button>
                </skeleton>

                <skeleton :content="4">
                    <delete-database-host-modal :host="result" />
                </skeleton>
            </td>
        </template>
    </list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CreateDatabaseHostModal from './CreateDatabaseHostModal.vue';
import DeleteDatabaseHostModal from './DeleteDatabaseHostModal.vue';

export default defineComponent({
    components: { CreateDatabaseHostModal, DeleteDatabaseHostModal },
    setup() {
        return {
            listFields: <ListField[]>[
                { key: 'id', skeleton: 3, features: ['code'] },
                { key: 'name', skeleton: 12 },
                { key: 'host', skeleton: 12, features: ['code'] },
                { key: 'port', skeleton: 6, features: ['code'] },
                { key: 'username', skeleton: 8, features: ['code'] },
                { key: 'databases', skeleton: 4 },
                { key: 'node', skeleton: 8 }
            ],
        };
    }
});
</script>
