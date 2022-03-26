<template>
    <container title="client.security_keys.title" no-padding>
        <template #actions>
            <div class="text-right">
                <create-security-key-button />
            </div>
        </template>

        <list service-id="securityKeys@getAll" :per-page="12" :fields="listFields">
            <template #headers-after>
                <th />
            </template>

            <template #fields-after="{ result }">
                <td class="p-4">
                    <skeleton :content="8">
                        <v-button color="danger">
                            todo: delete
                        </v-button>
                    </skeleton>
                </td>
            </template>
        </list>
    </container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dispatch } from '~/core';
import CreateSecurityKeyButton from './CreateSecurityKeyButton.vue';

export default defineComponent({
    components: { CreateSecurityKeyButton },
    setup() {
        const updateList = () => dispatch('lists/refresh', 'securityKeys@getAll');

        return {
            updateList,

            listFields: <ListField[]>[
                { key: 'name', features: ['code'], skeleton: 6 },
                { label: 'created', key: 'createdAt', format: 'datetime', skeleton: 8 },
                { label: 'last_used', key: 'updatedAt', format: 'datetime', skeleton: 8 }
            ],
        };
    },
});
</script>
