<template>
    <list service-id="servers@getAll" :fields="listFields" :data="listExtraData" searchable>
        <template #search-extra>
            <div class="ml-4">
                <v-button color="primary" :to="{ name: 'admin.management.servers.new' }" permission="server.create">
                    <t path="generic.create" />
                </v-button>
            </div>
        </template>

        <template #headers-after>
            <th />
        </template>

        <template #field-name="{ result }">
            <div class="flex items-center">
                <server-status-indicator :server="result" />

                <v-button permission="server.read" :to="{ name: 'admin.management.servers.manage.about', params: { server: result.id } }" class="ml-4 text-white/75">
                    {{ result.name }}
                </v-button>
            </div>
        </template>

        <template #field-owner="{ result }">
            <div class="flex items-center">
                <avatar :email="result.user.email" class="rounded-full h-10" />
                <v-button permission="user.read" :to="{ name: 'admin.management.users.manage.about', params: { user: result.user.id } }" class="text-white/75 grow pl-4">
                    {{ result.user.fullName }}
                </v-button>
            </div>
        </template>

        <template #field-node="{ result }">
            <v-button permission="node.read" :to="{ name: 'admin.management.nodes.manage.about', params: { node: result.node.id } }" class="text-white/75">
                {{ result.node.name }}
            </v-button>
        </template>

        <template #field-connection="{ result }">
            <code v-clipboard="result.primaryAllocation().connection">
                {{ result.primaryAllocation().connection }}
            </code>
        </template>

        <template #fields-after="{ result } ">
            <td class="p-6 text-right">
                <skeleton :content="8">
                    <v-button permission="server.read" :to="{ name: 'admin.management.servers.manage.about', params: { server: result.id } }" color="primary">
                        <t path="generic.manage" />
                    </v-button>
                </skeleton>
            </td>
        </template>
    </list>

</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import ServerStatusIndicator from './ServerStatusIndicator.vue';

export default defineComponent({
    components: { ServerStatusIndicator },

    props: {
        filterUser: {
            type: Number,
        },
        filterNode: {
            type: Number,
        },
    },
    setup(props) {
        return {
            listFields: <ListField[]>[
                { key: 'name', skeleton: 8 },
                { key: 'uuid', features: ['code'], skeleton: 16 },
                { key: 'owner', skeleton: 12 },
                { key: 'node', skeleton: 6 },
                { key: 'connection', skeleton: 12 },
            ],

            listExtraData: computed(() => {
                const data: Record<string, number> = {};
                if (props.filterUser) data['filter[owner_id]'] = props.filterUser;
                if (props.filterNode) data['filter[node_id]'] = props.filterNode;

                return data;
            })
        };
    }
});
</script>
