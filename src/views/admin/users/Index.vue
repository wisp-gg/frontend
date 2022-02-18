<template>
    <list service-id="users@getAll" :fields="listFields" searchable>
        <template #search-extra>
            <div class="ml-4">
                <v-button color="primary" permission="user.create" :to="{ name: 'admin.management.users.new' }">
                    <t path="generic.create" />
                </v-button>
            </div>
        </template>

        <template #headers-after>
            <th />
        </template>

        <template #field-fullName="{ result }">
            <v-button permission="user.read" :to="{ name: 'admin.management.users.manage.about', params: { user: result.id } }" class="text-white/75">
                {{ result.fullName }}
            </v-button>
        </template>

        <template #field-useTotp="{ result }">
            <fa
                :icon="['fas', result.useTotp ? 'lock' : 'lock-open']"
                :class="result.useTotp ? 'text-success' : 'text-danger'"
                size="lg"
            />
        </template>

        <template #fields-after="{ result } ">
            <td class="p-6 text-right space-x-4">
                <skeleton :content="8">
                    <v-button permission="user.read" :to="{ name: 'admin.management.users.manage.about', params: { user: result.id } }" color="primary">
                        <t path="generic.manage" />
                    </v-button>
                </skeleton>

                <skeleton :content="4">
                    <delete-user-modal :user="result" />
                </skeleton>
            </td>
        </template>
    </list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DeleteUserModal from './DeleteUserModal.vue';

export default defineComponent({
    components: {
        DeleteUserModal,
    },

    setup() {
        return {
            listFields: <ListField[]>[
                { key: 'id', skeleton: 3, features: ['code'] },
                { key: 'fullName', label: 'name', skeleton: 14 },
                { key: 'email', skeleton: 8 },
                { key: 'useTotp', label: '2fa', skeleton: 1 },
                { key: 'serversCount', label: 'servers', skeleton: 1, features: ['code'] },
            ]
        };
    }
});
</script>
