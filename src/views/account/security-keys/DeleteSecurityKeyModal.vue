<template>
    <modal has-alerts title="client.security_keys.delete_key">
        <template #opener="{ open }">
            <v-button @click="open" v-tippy="'generic.delete'" color="danger" class="py-3 px-6">
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default="{ close }">
            <t :path="['client.security_keys.delete_key_notice', { name: securityKey.name }]" />

            <v-form class="mt-4" :service-id="confirm" :can-submit="canDelete" :on-success="close">
                <v-input name="confirm_name" v-model:value="confirmNameValue" />

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
import { dispatch } from '~/core';
import { SecurityKey } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        securityKey: {
            type: SecurityKey,
            required: true,
        },
    },
    setup(props) {
        const confirmNameValue = ref<string>();

        return {
            confirmNameValue,

            canDelete: computed(() => confirmNameValue.value === props.securityKey.name),

            confirm: () => {
                return useService('securityKeys@delete', 'server.security_keys.delete_key', {
                    id: props.securityKey.uuid
                }).then(() => dispatch('lists/refresh', 'securityKeys@getAll'));
            }
        };
    }
});
</script>
