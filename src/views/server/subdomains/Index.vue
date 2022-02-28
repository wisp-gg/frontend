<template>
    <container title="server.subdomains.title" :description="['server.subdomains.using_subdomains', { count: subdomainCount, limit: subdomainLimit === null ? '∞' : subdomainLimit }]" no-padding>
        <template #actions>
            <div class="text-right">
                TODO: Create
            </div>
        </template>

        <list service-id="subdomains@getAll" :fields="listFields" @meta="onMeta">
            <template #headers-after>
                <th />
            </template>

            <template #fields-after="{ result }">
                <td class="p-6 text-right">
                    <skeleton :content="4">
                        <v-button color="danger">
                            TODO: Delete
                        </v-button>
                    </skeleton>
                </td>
            </template>
        </list>
    </container>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';

export default defineComponent({
    setup() {
        const subdomainCount = ref(0);

        return {
            onMeta: (results: ListResponseMeta) => subdomainCount.value = results.pagination.total,

            subdomainLimit: computed(() => null), // TODO: Implement state.models.server?.featureLimits.subdomains
            subdomainCount,

            listFields: <ListField[]>[
                { label: 'name', key: 'displayName', skeleton: 12 },
            ],
        };
    },
});
</script>
