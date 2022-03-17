<template>
    <container no-padding title="admin.application_api.title">
        <template #actions>
            <v-button color="primary" permission="application_api.create" :to="{ name: 'admin.administration.application_api.new' }">
                <t path="generic.create" />
            </v-button>
        </template>

        <list service-id="apiKeys@getAll" :fields="listFields">
            <template #headers-after>
                <th />
            </template>

            <template #field-user="{ result }">
                <div class="flex items-center">
                    <avatar :email="result.user.email" class="rounded-full h-10 mx-auto" />
                    <p class="grow pl-4">
                        {{ result.user.fullName }}
                    </p>
                </div>
            </template>

            <template #fields-after="{ result }">
                <td class="p-4 text-right space-x-4">
                    <skeleton :content="6">
                        <v-button color="primary" permission="application_api.read" :to="{ name: 'admin.administration.application_api.manage', params: { apiKey: result.identifier } }">
                            <t path="generic.manage" />
                        </v-button>
                    </skeleton>

                    <skeleton :content="4">
                        <delete-application-api-modal :api-key="result" />
                    </skeleton>
                </td>
            </template>
        </list>
    </container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DeleteApplicationApiModal from './DeleteApplicationApiModal.vue';

export default defineComponent({
    components: { DeleteApplicationApiModal },

    setup(props, context) {
        return {
            listFields: <ListField[]>[
                { label: 'name', key: 'memo', skeleton: 16 },
                { label: 'assigned_to', key: 'user', skeleton: 8 },
                { key: 'key', features: ['secret', 'code', 'clipboard'], skeleton: 24 },
                { label: 'last_used', key: 'lastUsedAt', format: 'datetime', skeleton: 12 },
                { label: 'created_at', key: 'createdAt', format: 'datetime', skeleton: 12 },
            ],
        };
    },
});
</script>
