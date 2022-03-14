<template>
    <list service-id="nests@getAll" :fields="listFields" searchable>
        <template #search-extra>
            <div class="ml-4 flex items-center space-x-4">
                <import-egg-modal />
                <create-nest-modal />
            </div>
        </template>

        <template #field-name="{ result }">
            <v-button class="text-white/75" permission="nest.update" :to="{ name: 'admin.service_management.nests.manage', params: { nest: result.id } }">
                {{ result.name }}
            </v-button>
        </template>
    </list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ImportEggModal from '~/views/admin/nests/ImportEggModal.vue';
import CreateNestModal from '~/views/admin/nests/CreateNestModal.vue';

export default defineComponent({
    components: { ImportEggModal, CreateNestModal },
    setup() {
        return {
            listFields: <ListField[]>[
                { key: 'id', features: ['code'], skeleton: 4 },
                { key: 'name', skeleton: 8 },
                { key: 'description', skeleton: 12 },
                { key: 'eggsCount', label: 'eggs', features: ['code'], skeleton: 4 },
                { key: 'serversCount', label: 'servers', features: ['code'], skeleton: 4 },
            ]
        };
    }
});
</script>
