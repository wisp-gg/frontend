<template>
    <div class="flex flex-wrap items-start lg:flex-nowrap gap-x-6">
        <container class="w-full lg:w-3/4" title="client.security.credentials_list" no-padding>
            <template #actions>
                <div class="text-right">
                    <a href="https://www.notion.so/API-Documentation-7b6a2cd53a1047aa9f8c7942ca0c1fe1" target="_blank" class="mr-3 text-white text-opacity-50">
                        <t path="generic.api_docs" />
                    </a>
                    <create-credential-button />
                </div>
            </template>

            <list service-id="account@getCredentials" :per-page="12" :fields="listFields">
                <template #headers-after>
                    <th />
                </template>

                <template #fields-after="{ result }">
                    <td class="p-6 text-right">
                        <skeleton :content="8">
                            <v-form service-id="security@deleteCredential" :on-success="updateList">
                                <v-input type="hidden" name="identifier" :value="result.identifier" />

                                <v-button color="danger" class="py-3 px-6" @click="deleteKey(result)">
                                    <t path="generic.delete" />
                                </v-button>
                            </v-form>
                        </skeleton>
                    </td>
                </template>
            </list>
        </container>

        <container class="w-full lg:w-1/4" title="client.security.2fa">
            <p class="text-white text-opacity-70 mb-4">
                <t :path="`client.security.2fa_${user.useTotp ? 'enabled' : 'disabled'}`" />
            </p>

            <div v-if="user.useTotp">
                <v-form service-id="security@disable2Fa">
                    <v-input name="token" rule="required" />

                    <div class="text-right">
                        <v-submit color="danger" label="client.security.disable_2fa" />
                    </div>
                </v-form>
            </div>
            <div v-else class="text-right">
                <enable2fa-button />
            </div>
        </container>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { dispatch, state } from '~/core';
import CreateCredentialButton from './CreateCredentialButton.vue';
import Enable2faButton from './Enable2faButton.vue';
import { ApiKey } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    components: { CreateCredentialButton, Enable2faButton },
    setup() {
        const updateList = () => dispatch('lists/refresh', 'account@getCredentials');

        return {
            user: computed(() => state.user.data),

            deleteKey: (key: ApiKey) => {
                return useService('security@deleteCredential', true, {
                    identifier: key.identifier
                }).then(updateList);
            },

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
