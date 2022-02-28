<template>
    <container title="server.subdomains.title" no-padding>
        <template #actions>
            <div class="text-right">
                <create-subdomain-modal />
            </div>
        </template>

        <list service-id="subdomains@getAll" :fields="listFields">
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
import { defineComponent } from 'vue';
import CreateSubdomainModal from './CreateSubdomainModal.vue';

export default defineComponent({
    components: { CreateSubdomainModal },
    setup() {
        return {
            listFields: <ListField[]>[
                { label: 'name', key: 'displayName', features: ['code', 'clipboard'], skeleton: 12 },
            ],
        };
    },
});
</script>
