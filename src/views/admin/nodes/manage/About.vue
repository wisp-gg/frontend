<template>
    <div class="flex flex-col lg:flex-row lg:space-x-4 gap-y-4">
        <div class="w-full lg:w-3/5">
            <container title="generic.information">
                <div class="grid">
                    <table>
                        <tbody>
                            <tr>
                                <td class="pb-2">
                                    <t path="admin.nodes.about.daemon_version" />
                                </td>
                                <td class="pb-2">
                                    <skeleton :content="8">
                                        <code v-if="daemonInfo?.version">
                                            {{ daemonInfo?.version }}
                                        </code>
                                        <code v-else>
                                            <t path="generic.unknown" />
                                        </code>
                                    </skeleton>
                                </td>
                            </tr>

                            <tr>
                                <td class="pb-2">
                                    <t path="admin.nodes.about.system_information" />
                                </td>
                                <td class="pb-2">
                                    <skeleton :content="20">
                                        <div v-if="daemonInfo?.system">
                                            {{ daemonInfo?.system?.type }}({{ daemonInfo?.system?.arch }})

                                            <code>
                                                {{ daemonInfo?.system?.kernel }}
                                            </code>
                                        </div>
                                        <code v-else>
                                            <t path="generic.unknown" />
                                        </code>
                                    </skeleton>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <t path="admin.nodes.about.cpu_cores" />
                                </td>
                                <td>
                                    <skeleton :content="8">
                                        {{ daemonInfo?.system?.cpus }}
                                    </skeleton>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </container>

            <container v-if="node ? node?.description : true" title="generic.description" class="mt-4">
                <pre class="whitespace-normal bg-primary-300 p-2 rounded-lg">
                    <!-- TODO: skeleton looks awkward for this -->
                    <skeleton :content="60">
                        {{ node?.description }}
                    </skeleton>
                </pre>
            </container>

            <div class="bg-primary-500 p-4 rounded text-right space-x-4 mt-4">
                <skeleton :content="4">
                    <delete-node-modal :node="node" />
                </skeleton>
            </div>
        </div>

        <div class="w-full lg:w-2/5">
            <container title="generic.at_a_glance">
                TODO
                <!--                <node-statistic />-->
            </container>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { state } from '~/core';
import { onModelLoaded, useService } from '~/plugins';
import { NodeDaemonInfo } from '~/api/services/admin/nodes';
import NodeStatistic from './NodeStatistic.vue';
import DeleteNodeModal from '~/views/admin/nodes/manage/DeleteNodeModal.vue';

export default defineComponent({
    components: { DeleteNodeModal, NodeStatistic },
    setup() {
        const daemonInfo = ref<NodeDaemonInfo | null>(null);

        onModelLoaded('node', node => {
            useService<NodeDaemonInfo>('nodes@daemonInfo', true, {
                id: node.id,
            }).then(info => daemonInfo.value = info);
        });

        return {
            node: computed(() => state.models.node),
            daemonInfo,
        };
    }
});
</script>
