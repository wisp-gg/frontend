<template>
    <container title="server.subusers.title" no-padding>
        <template #actions>
            <div class="text-right">
                <manage-subuser-modal />
            </div>
        </template>

        <list service-id="subusers@getAll" :fields="listFields">
            <template #headers-after>
                <th />
            </template>
            
            <template #no-items-extra>
              <div class="pt-2">
                <manage-subuser-modal />
              </div>
            </template>

            <template #field-name="{ result }">
                <div class="flex items-center">
                    <avatar :email="result.user.email" class="rounded-full h-10" />
                    <p class="ml-4">{{ result.user.fullName }}</p>
                </div>
            </template>

            <template #field-email="{ result }">
                <code v-clipboard>{{ result.user.email }}</code>
            </template>

            <template #field-2fa="{ result }">
                <fa
                    :icon="['fas', result.user.has2fa ? 'lock' : 'lock-open']"
                    :class="result.user.has2fa ? 'text-success' : 'text-danger'"
                    size="lg"
                />
            </template>

            <template #fields-after="{ result }">
                <td class="p-6 text-right">
                    <div class="space-x-4">
                        <skeleton :content="6">
                            <manage-subuser-modal :subuser="result" />
                        </skeleton>

                        <skeleton :content="4">
                            <delete-subuser-modal :subuser="result" />
                        </skeleton>
                    </div>
                </td>
            </template>
        </list>
    </container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ManageSubuserModal from './ManageSubuserModal.vue';
import DeleteSubuserModal from './DeleteSubuserModal.vue';

export default defineComponent({
    components: { ManageSubuserModal, DeleteSubuserModal },
    setup() {
        return {
            listFields: <ListField[]>[
                { key: 'name', skeleton: 8 },
                { key: 'email', skeleton: 12 },
                { key: '2fa', skeleton: 4 },
                { label: 'created_at', key: 'createdAt', format: 'datetime', skeleton: 12 },
            ],
        };
    },
});
</script>
