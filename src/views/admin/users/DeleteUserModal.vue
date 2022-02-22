<template>
    <modal has-alerts title="admin.users.delete_user">
        <template #opener="{ open }">
            <v-button @click="open" color="danger" class="py-3 px-6" permission="user.delete" :tooltip="tooltip" :disabled="disabled">
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t :path="['admin.users.delete_notice', { email: user.email }]" />

            <v-form class="mt-4" :service-id="confirm" :can-submit="canDelete">
                <v-input name="confirm_email" v-model:value="confirmEmailValue" />

                <div class="text-right">
                    <v-submit color="danger">
                        <t path="generic.delete" />
                    </v-submit>
                </div>
            </v-form>
        </template>
    </modal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { state, dispatch } from '~/core';
import { User } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        user: {
            type: User,
            required: true,
        },
    },
    setup(props) {
        const confirmEmailValue = ref<string>();

        return {
            confirmEmailValue,

            canDelete: computed(() => confirmEmailValue.value === props.user.email),

            tooltip: computed(() => {
                if (state.user.data?.email === props.user.email) return 'admin.users.cant_delete_yourself';
                else if (props.user.serversCount > 0) return 'admin.users.cant_delete_user_with_servers';

                return 'generic.delete';
            }),
            disabled: computed(() => {
                return state.user.data?.email === props.user.email || props.user.serversCount > 0;
            }),

            confirm: () => {
                return useService('users@delete', 'admin.users.delete_user', {
                    id: props.user.id
                }).then(() => dispatch('lists/refresh', 'users@getAll'));
            }
        };
    }
});
</script>
