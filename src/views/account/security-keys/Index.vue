<template>
    <container title="client.security_keys.title" no-padding>
        <template #actions>
            <div class="text-right">
                <create-security-key-modal />
            </div>
        </template>

        <list service-id="securityKeys@getAll" :per-page="12" :fields="listFields">
            <template #headers-after>
                <th />
            </template>

            <template #fields-after="{ result }">
                <td class="text-right p-4">
                    <skeleton :content="8">
                        <delete-security-key-modal :security-key="result" />
                    </skeleton>
                </td>
            </template>
        </list>
    </container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CreateSecurityKeyModal from './CreateSecurityKeyModal.vue';
import DeleteSecurityKeyModal from './DeleteSecurityKeyModal.vue';

export default defineComponent({
    components: { CreateSecurityKeyModal, DeleteSecurityKeyModal },
    setup() {
        return {
            listFields: <ListField[]>[
                { key: 'name', features: ['code'], skeleton: 6 },
                { label: 'created', key: 'createdAt', format: 'datetime', skeleton: 8 },
                { label: 'last_used', key: 'lastUsedAt', format: 'datetime', skeleton: 8 }
            ],
        };
    },
});
</script>
