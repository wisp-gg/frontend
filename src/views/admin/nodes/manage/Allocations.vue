<template>
    <div class="flex flex-col lg:flex-row lg:space-x-4 gap-y-4 items-start">
        <container no-padding class="lg:w-2/3" title="admin.nodes.allocations.title">
            <template #actions>
                <delete-allocation-ip-modal />
            </template>

            <list service-id="nodeAllocations@getAll" :fields="listFields">
                <template #headers-after>
                    <th />
                </template>

                <template #field-alias="{ result }">
                    <v-input permission="node_allocation.update" hide-label name="alias" :value="result.alias" @keyup="updateAlias($event, result)" />
                </template>

                <template #field-server="{ result }">
                    <v-button v-if="result.server" permission="server.read" :to="{ name: 'admin.management.servers.manage.about', params: { server: result.server.id } }" class="text-white/75">
                        {{ result.server.name }}
                    </v-button>
                </template>

                <template #fields-after="{ result }">
                    <td class="p-6">
                        <skeleton :content="4">
                            <v-button
                                @click="deleteAllocation(result)"
                                color="danger"
                                class="py-3 px-6"
                                :tooltip="result.server ? 'admin.nodes.allocations.cant_delete_in_use' : 'generic.delete'"
                                :disabled="result.server"
                                permission="node_allocation.delete"
                            >
                                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
                            </v-button>
                        </skeleton>
                    </td>
                </template>
            </list>
        </container>

        <container class="lg:w-1/3" title="admin.nodes.allocations.create_new">
            <v-form service-id="nodeAllocations@create" :on-success="updateList">
                <!-- TODO: Validator ip-cidr rule -->
                <v-select
                    name="ip"
                    mode="tags"
                    taggable
                    rule="required"
                    no-translate
                />
                <v-input name="alias" />

                <v-select
                    name="ports"
                    mode="tags"
                    taggable
                    rule="required"
                    no-translate
                />

                <div class="text-right">
                    <v-submit color="primary" permission="node_allocation.create">
                        <t path="generic.create" />
                    </v-submit>
                </div>
            </v-form>
        </container>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import state from '~/state';
import { useService } from '~/plugins';
import { Allocation } from '~/api/models';
import DeleteAllocationIpModal from '~/views/admin/nodes/manage/DeleteAllocationIpModal.vue';
import debounce from 'debounce';

export default defineComponent({
    components: { DeleteAllocationIpModal },
    setup() {
        const updateList = () => state.lists.refresh('nodeAllocations@getAll');

        return {
            node: computed(() => state.models.node),

            deleteAllocation: (allocation: Allocation) => {
                return useService('nodeAllocations@delete', true, { id: allocation.id })
                    .then(updateList);
            },

            updateList,
            updateAlias: debounce((evt: KeyboardEvent, allocation: Allocation) => {
                const value = (<HTMLInputElement> evt.target).value;

                useService<ListResponse>('nodeAllocations@update', true, {
                    id: allocation.id,
                    alias: value,
                }).then(() => {
                    updateList();

                    state.alerts.add({
                        timeout: 2500,

                        type: 'success',
                        title: ['admin.nodes.allocations.allocation_updated'],
                    });
                });
            }, 300),

            listFields: <ListField[]>[
                { key: 'ip', features: ['code', 'clipboard'], skeleton: 12 },
                { key: 'alias', skeleton: 12 },
                { key: 'port', features: ['code'], skeleton: 6 },
                { key: 'server', label: 'assigned_to', skeleton: 12 },
            ]
        };
    }
});
</script>
