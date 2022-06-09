<template>
    <list service-id="modpacks@get" :fields="listFields" :per-page="10" searchable>
        <template #headers-after>
            <th />
        </template>

        <template #field-name="{ result }">
            <div class="flex items-center">
                <img :src="result.thumbnailUrl" class="w-16 mr-4">
                <p>{{ result.name }}</p>
            </div>
        </template>

        <template #fields-after="{ result }">
            <td class="p-6 text-right">
                <div class="space-x-4">
                    <skeleton :content="8">
                        <install-modpack-modal :modpack="result" />
                    </skeleton>
                </div>
            </td>
        </template>
    </list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InstallModpackModal from './InstallModpackModal.vue';

export default defineComponent({
    components: { InstallModpackModal },
    setup() {
        return {
            listFields: <ListField[]>[
                { key: 'name', skeleton: 8 },
                { key: 'description', skeleton: 16 },
                { key: 'downloads', format: 'number', skeleton: 8 },
            ],
        };
    },
});
</script>
