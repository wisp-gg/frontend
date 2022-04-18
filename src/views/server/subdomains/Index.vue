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

            <template #field-allocation="{ result }">
                <code v-clipboard>
                    {{ result.allocation?.connection }}
                </code>
            </template>

            <template #fields-after="{ result }">
                <td class="p-6 text-right">
                    <skeleton :content="4">
                        <delete-subdomain-modal :subdomain="result" />
                    </skeleton>
                </td>
            </template>
        </list>
    </container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CreateSubdomainModal from './CreateSubdomainModal.vue';
import DeleteSubdomainModal from './DeleteSubdomainModal.vue';

export default defineComponent({
    components: { CreateSubdomainModal, DeleteSubdomainModal },
    setup() {
        return {
            listFields: <ListField[]>[
                { label: 'name', key: 'displayName', features: ['code', 'clipboard'], skeleton: 12 },
                { label: 'allocation', key: 'allocation', skeleton: 12 },
            ],
        };
    },
});
</script>
