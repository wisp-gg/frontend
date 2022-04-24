<template>
    <modal has-alerts title="server.subusers.delete_subuser">
        <template #opener="{ open }">
            <v-button @click="open" v-tippy="'generic.delete'" color="danger" permission="subuser.delete" class="py-3 px-6">
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default="{ close }">
            <t :path="['server.subusers.delete_subuser_notice', { name: subuser.user.fullName, email: subuser.user.email }]" />

            <v-form class="mt-4" :service-id="confirm" :on-success="close" :can-submit="canDelete">
                <v-input name="confirm_email" v-model:value="confirmationValue" />

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
import state from '~/state';
import { ServerSubuser } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        subuser: {
            type: ServerSubuser,
            required: true,
        },
    },
    setup(props) {
        const confirmationValue = ref<string>();

        return {
            confirmationValue,

            canDelete: computed(() => confirmationValue.value === props.subuser.user.email),

            confirm: () => {
                return useService('subusers@delete', 'server.subusers.delete_subuser', {
                    id: props.subuser.id
                }).then(() => state.lists.refresh('subusers@getAll'));
            }
        };
    }
});
</script>
