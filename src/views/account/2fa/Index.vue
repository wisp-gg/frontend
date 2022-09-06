<template>
    <div class="grid lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
        <container title="client.security.2fa">
            <p class="text-white text-opacity-70 mb-4">
                <t :path="`client.security.2fa_${user.mfaMethods?.includes('totp') ? 'enabled' : 'disabled'}`" />
            </p>

            <div v-if="user.mfaMethods?.includes('totp')">
                <v-form service-id="security@disable2Fa" :on-success="onSuccess">
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

    <container class="mt-4 lg:col-span-2 xl:col-span-3" title="client.security_keys.title" no-padding>
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
import { computed, defineComponent } from 'vue';
import { dispatch, state } from '~/core';
import CreateSecurityKeyModal from './CreateSecurityKeyModal.vue';
import DeleteSecurityKeyModal from './DeleteSecurityKeyModal.vue';
import Enable2faButton from './Enable2faButton.vue';

export default defineComponent({
    components: { CreateSecurityKeyModal, DeleteSecurityKeyModal, Enable2faButton },
    setup() {
        return {
            user: computed(() => state.user.data!),

            listFields: <ListField[]>[
                { key: 'name', features: ['code'], skeleton: 6 },
                { label: 'created', key: 'createdAt', format: 'datetime', skeleton: 8 },
                { label: 'last_used', key: 'lastUsedAt', format: 'datetime', skeleton: 8 }
            ],

            onSuccess: () => {
                dispatch('alerts/add', {
                    type: 'success',
                    title: ['client.security.2fa_disabled'],
                });

            }
        };
    },
});
</script>
