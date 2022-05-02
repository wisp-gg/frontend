<template>
    <list service-id="users@getAll" :fields="listFields" searchable>
        <template #search-extra>
            <div class="ml-4 flex">
                <v-button color="primary" permission="user.create" :to="{ name: 'admin.management.users.new' }">
                    <t path="generic.create" />
                </v-button>
            </div>
        </template>

        <template #headers-before>
            <th class="w-4" />
        </template>

        <template #headers-after>
            <th />
        </template>

        <template #fields-before="{ result }">
            <td class="p-6 text-center text-2xl">
                <skeleton :content="4">
                    <fa
                        v-if="result.rootAdmin || result.supportOp"
                        v-tippy="result.rootAdmin ? 'generic.admin' : 'generic.support_op'"
                        :icon="['fas', 'star']"
                        :class="result.rootAdmin ? ['text-yellow-300'] : ['text-accent-300']"
                    />
                </skeleton>
            </td>
        </template>

        <template #field-fullName="{ result }">
            <v-button permission="user.read" :to="{ name: 'admin.management.users.manage.about', params: { user: result.id } }" class="flex items-center text-white/75">
                <avatar :email="result.email" class="rounded-full h-10 mr-4" />

                {{ result.fullName }}
            </v-button>
        </template>

        <template #field-has2fa="{ result }">
            <fa
                :icon="['fas', result.has2fa ? 'lock' : 'lock-open']"
                :class="result.has2fa ? 'text-success' : 'text-danger'"
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
                { key: 'has2fa', label: '2fa', skeleton: 1 },
                { key: 'serversCount', label: 'servers', skeleton: 1, features: ['code'] },
            ]
        };
    }
});
</script>
