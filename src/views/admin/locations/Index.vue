<template>
    <container no-padding title="admin.locations.title">
        <template #actions>
            <create-location-modal />
        </template>

        <list service-id="locations@getAll" :fields="listFields">
            <template #headers-after>
                <th />
            </template>

            <template #field-short="{ result }">
                <v-button permission="location.read" :to="{ name: 'admin.management.locations.manage', params: { location: result.id } }" class="text-white/75">
                    {{ result.short }}
                </v-button>
            </template>

            <template #fields-after="{ result }">
                <td class="p-6 text-right space-x-4">
                    <skeleton :content="6">
                        <v-button color="primary" permission="location.read" :to="{ name: 'admin.management.locations.manage', params: { location: result.id } }">
                            <t path="generic.manage" />
                        </v-button>
                    </skeleton>

                    <skeleton :content="4">
                        <delete-location-modal :location="result" />
                    </skeleton>
                </td>
            </template>
        </list>
    </container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CreateLocationModal from './CreateLocationModal.vue';
import DeleteLocationModal from './DeleteLocationModal.vue';

export default defineComponent({
    components: { CreateLocationModal, DeleteLocationModal },
    setup() {
        return {
            listFields: <ListField[]>[
                { key: 'id', skeleton: 3, features: ['code'] },
                { label: 'name', key: 'short', skeleton: 8 },
                { label: 'description', key: 'long', skeleton: 16 },
                { label: 'nodes', key: 'nodesCount', features: ['code'], skeleton: 4 },
                { label: 'servers', key: 'serversCount', features: ['code'], skeleton: 4 },
            ],
        };
    }
});
</script>
