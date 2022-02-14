<template>
    <list service-id="nodes@getAll" :fields="listFields" searchable>
        <template #headers-before>
            <th />
        </template>

        <template #headers-after>
            <th />
        </template>

        <template #fields-before="{ result }">
            <td class="p-6 flex justify-center items-center">
                <skeleton :content="4">
                    <status-indicator :node="result" />
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
import { defineComponent } from 'vue';
import StatusIndicator from './StatusIndicator.vue';

export default defineComponent({
    components: { StatusIndicator },
    setup() {
        return {
            listFields: <ListField[]>[
                { key: 'name', skeleton: 8 },
                { key: 'location', skeleton: 12 },
                { label: 'memory', key: 'limits.memory', format: 'size', multiplier: 1000 * 1000, skeleton: 6 },
                { label: 'disk', key: 'limits.disk', format: 'size', multiplier: 1000 * 1000, skeleton: 6 },
                { label: 'servers', key: 'serversCount', features: ['code'], skeleton: 4 },
            ]
        };
    }
});
</script>
