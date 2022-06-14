<template>
    <container title="client.security.credentials_list" no-padding>
        <template #actions>
            <div class="text-right">
                <a href="https://docs.panel.gg/" target="_blank" class="mr-3 text-white text-opacity-50">
                    <t path="generic.api_docs" />
                </a>
                <create-credential-modal />
            </div>
        </template>

        <list service-id="account@getCredentials" :per-page="12" :fields="listFields">
            <template #headers-after>
                <th />
            </template>

            <template #fields-after="{ result }">
                <td class="p-4 w-full xl:w-auto block xl:table-cell ml-auto text-right">
                    <skeleton :content="8">
                        <v-form service-id="security@deleteCredential" :on-success="updateList">
                            <v-input type="hidden" name="identifier" :value="result.identifier" />

                            <v-button color="danger" class="py-3 px-6" @click="deleteKey(result)" spinner>
                                <t path="generic.delete" />
                            </v-button>
                        </v-form>
                    </skeleton>
                </td>
            </template>
        </list>
    </container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dispatch } from '~/core';
import CreateCredentialModal from './CreateCredentialModal.vue';
import { ApiKey } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    components: { CreateCredentialModal },
    setup() {
        const updateList = () => dispatch('lists/refresh', 'account@getCredentials');

        return {
            deleteKey: (key: ApiKey) => useService('security@deleteCredential', true, {
                identifier: key.identifier
            }).then(updateList),

            updateList,
            listFields: <ListField[]>[
                { key: 'key', features: ['secret', 'clipboard'], skeleton: 6 },
                { key: 'memo', skeleton: 12 },
                { label: 'last_used', key: 'lastUsedAt', format: 'datetime', skeleton: 8 },
                { label: 'created', key: 'createdAt', format: 'datetime', skeleton: 8 }
            ],
        };
    },
});
</script>
