<template>
    <div class="flex flex-col lg:flex-row items-start gap-x-4">
        <container no-padding title="generic.information" class="lg:w-2/3">
            <table class="w-full">
                <tr class="odd:bg-primary-500 even:bg-primary-400">
                    <td class="p-4">
                        <t path="components.table.labels.internal_identifier" />
                    </td>
                    <td class="p-4">
                        <skeleton :content="4">
                            <code>{{ server.id }}</code>
                        </skeleton>
                    </td>
                </tr>
                <tr class="odd:bg-primary-500 even:bg-primary-400">
                    <td class="p-4">
                        <t path="components.table.labels.external_identifier" />
                    </td>
                    <td class="p-4">
                        <skeleton :content="8">
                            <code v-if="server.externalId">{{ server.externalId }}</code>
                        </skeleton>
                    </td>
                </tr>
                <tr class="odd:bg-primary-500 even:bg-primary-400">
                    <td class="p-4">
                        <t path="components.table.labels.uuid" />
                    </td>
                    <td class="p-4">
                        <skeleton :content="16">
                            <code>{{ server.uuid }}</code>
                        </skeleton>
                    </td>
                </tr>
                <tr class="odd:bg-primary-500 even:bg-primary-400">
                    <td class="p-4">
                        <t path="components.table.labels.service" />
                    </td>
                    <td class="p-4">
                        <skeleton :content="24">
                            <v-button permission="nest.read" :to="{ name: 'admin.service_management.nests.manage', params: { nest: server.nest.id } }" class="text-white/75 hover:text-white">
                                {{ server.nest.name }}
                            </v-button>
                            -
                            <v-button permission="egg.read" :to="{ name: 'admin.service_management.nests.egg.configuration', params: { nest: server.nest.id, egg: server.egg.id } }" class="text-white/75 hover:text-white">
                                {{ server.egg.name }}
                            </v-button>
                        </skeleton>
                    </td>
                </tr>
                <tr class="odd:bg-primary-500 even:bg-primary-400">
                    <td class="p-4">
                        <t path="components.table.labels.name" />
                    </td>
                    <td class="p-4">
                        <skeleton :content="12">
                            {{ server.name }}
                        </skeleton>
                    </td>
                </tr>
                <tr class="odd:bg-primary-500 even:bg-primary-400">
                    <td class="p-4">
                        <t path="components.table.labels.cpu" />
                    </td>
                    <td class="p-4">
                        <skeleton :content="6">
                            <code>{{ server.limits.cpu }} %</code>
                        </skeleton>
                    </td>
                </tr>
                <tr class="odd:bg-primary-500 even:bg-primary-400">
                    <td class="p-4">
                        <t path="components.table.labels.memory" />
                    </td>
                    <td class="p-4">
                        <skeleton :content="12">
                            <code>{{ server.limits.memory }} MB</code> / <code>{{ server.limits.swap }} MB</code>
                        </skeleton>
                    </td>
                </tr>
                <tr class="odd:bg-primary-500 even:bg-primary-400">
                    <td class="p-4">
                        <t path="components.table.labels.disk" />
                    </td>
                    <td class="p-4">
                        <skeleton :content="12">
                            <code>{{ server.limits.disk }} MB</code>
                        </skeleton>
                    </td>
                </tr>
                <tr class="odd:bg-primary-500 even:bg-primary-400">
                    <td class="p-4">
                        <t path="components.table.labels.block_io_weight" />
                    </td>
                    <td class="p-4">
                        <skeleton :content="6">
                            <code>{{ server.limits.io }}</code>
                        </skeleton>
                    </td>
                </tr>
                <tr class="odd:bg-primary-500 even:bg-primary-400">
                    <td class="p-4">
                        <t path="components.table.labels.backup_size_limit" />
                    </td>
                    <td class="p-4">
                        <skeleton :content="6">
                            <code>{{ server.featureLimits.backupMegabytes }} MB</code>
                        </skeleton>
                    </td>
                </tr>
                <tr class="odd:bg-primary-500 even:bg-primary-400">
                    <td class="p-4">
                        <t path="components.table.labels.default_connection" />
                    </td>
                    <td class="p-4">
                        <skeleton :content="16">
                            <code>{{ server.primaryAllocation().connection }}</code>
                        </skeleton>
                    </td>
                </tr>
                <tr class="odd:bg-primary-500 even:bg-primary-400">
                    <td class="p-4">
                        <t path="components.table.labels.connection_alias" />
                    </td>
                    <td class="p-4">
                        <skeleton :content="12">
                            <code>{{ server.primaryAllocation().displayName() }}</code>
                        </skeleton>
                    </td>
                </tr>
            </table>
        </container>

        <div class="lg:w-1/3">
            <div class="bg-primary-500 p-4 rounded-lg">
                <div class="bg-primary-300 rounded-lg">
                    <div class="flex p-4">
                        <div class="grow text-white/75 hover:text-white/100">
                            <h1 class="text-3xl font-semibold tracking-wide">
                                <skeleton :content="12">
                                    {{ server.user.fullName }}
                                </skeleton>
                            </h1>
                            <h2 class="mt-2">
                                <t path="admin.servers.about.server_owner" />
                            </h2>
                        </div>

                        <skeleton circle>
                            <avatar :email="server.user.email" class="rounded-full h-16 mx-auto" />
                        </skeleton>
                    </div>

                    <div class="text-center border-t border-white/25 py-2">
                        <skeleton :content="8">
                            <v-button class="text-white/75 hover:text-white" permission="user.read" :to="{ name: 'admin.management.users.manage', params: { user: server.user.id } }">
                                <t path="generic.more_info" />
                            </v-button>
                        </skeleton>
                    </div>
                </div>

                <div class="bg-primary-300 rounded-lg mt-4">
                    <div class="p-4 text-white/75 hover:text-white/100">
                        <h1 class="text-3xl font-semibold tracking-wide">
                            <skeleton :content="12">
                                {{ server.node.name }}
                            </skeleton>
                        </h1>
                        <h2 class="mt-2">
                            <t path="admin.servers.about.server_node" />
                        </h2>
                    </div>

                    <div class="text-center border-t border-white/25 py-2">
                        <skeleton :content="8">
                            <v-button class="text-white/75 hover:text-white" permission="node.read" :to="{ name: 'admin.management.nodes.manage.about', params: { node: server.node.id } }">
                                <t path="generic.more_info" />
                            </v-button>
                        </skeleton>
                    </div>
                </div>
            </div>

            <div class="bg-primary-500 p-4 rounded text-right space-x-4 mt-4">
                <skeleton :content="4">
                    <delete-server-modal :server="server" />
                </skeleton>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';
import Avatar from '~/components/Avatar.vue';
import DeleteServerModal from '~/views/admin/servers/manage/DeleteServerModal.vue';

export default defineComponent({
    components: { DeleteServerModal, Avatar },
    setup() {
        return {
            server: computed(() => state.models.server!),
        };
    }
});
</script>
