<template>
    <list service-id="nodes@getAll" :fields="listFields" searchable @results="onResults">
        <template #headers-before>
            <th />
        </template>

        <template #headers-after>
            <th />
        </template>

        <template #fields-before="{ result }">
            <td class="p-6 flex justify-center items-center">
                <skeleton :content="4">
                    <status-indicator :loading-first="loadingFirst" :daemon-info="daemonInfo[result.id]" />
                </skeleton>
            </td>
        </template>

        <template #field-name="{ result }">
            <v-button permission="node.read" :to="{ name: 'admin.management.nodes.manage.about', params: { node: result.id } }" class="text-white/75">
                {{ result.name }}
            </v-button>
        </template>

        <template #field-location="{ result }">
            {{ result.location.short }}
        </template>

        <template #fields-after="{ result } ">
            <td class="p-6 text-right">
                <skeleton :content="8">
                    <v-button permission="node.read" :to="{ name: 'admin.management.nodes.manage.about', params: { node: result.id } }" color="primary">
                        <t path="generic.manage" />
                    </v-button>
                </skeleton>
            </td>
        </template>
    </list>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import StatusIndicator from './StatusIndicator.vue';
import { useService } from '~/plugins';
import { Node } from '~/api/models';
import { NodeDaemonInfo } from '~/api/services/admin/nodes';

export default defineComponent({
    components: { StatusIndicator },
    setup() {
        const nodes = ref<Node[]>([]);
        const loadingFirst = ref<boolean>(true);
        const daemonInfo = ref<Record<string, any>>({});

        let timer: NodeJS.Timer | null = null;

        const fetchDaemonInfo = async () => {
            if (!nodes.value.length) return null;

            const res = await useService<Record<string, NodeDaemonInfo>>('nodes@daemonInfo', { displayErrorsInUI: true, background: true }, {
                nodes: nodes.value.map(n => n.id),
            });

            daemonInfo.value = res;
            if (loadingFirst.value) loadingFirst.value = false;
        };

        onMounted(() => {
            timer = setInterval(fetchDaemonInfo, 10 * 1000);
        });
        onUnmounted(() => timer && clearInterval(timer));

        return {
            loadingFirst,
            daemonInfo,

            onResults: (results: Node[]) => {
                nodes.value = results.filter(Boolean);

                fetchDaemonInfo();
            },

            listFields: <ListField[]>[
                { key: 'name', skeleton: 8 },
                { key: 'location', skeleton: 12 },
                { label: 'memory', key: 'limits.memory', format: 'size', multiplier: 1024 * 1024, skeleton: 6 },
                { label: 'disk', key: 'limits.disk', format: 'size', multiplier: 1024 * 1024, skeleton: 6 },
                { label: 'servers', key: 'serversCount', features: ['code'], skeleton: 4 },
            ]
        };
    }
});
</script>
