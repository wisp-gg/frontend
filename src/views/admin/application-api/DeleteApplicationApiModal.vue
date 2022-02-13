<template>
    <modal has-alerts title="admin.application_api.delete_api_key">
        <template #opener="{ open }">
            <v-button
                @click="open"
                color="danger"
                class="py-3 px-6"
                tooltip="generic.delete"
                permission="application_api.delete"
            >
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t :path="['admin.application_api.delete_notice', { name: apiKey.memo }]" />

            <v-form class="mt-4" :service-id="confirm" :can-submit="canDelete">
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
import { ApiKey } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        apiKey: {
            type: ApiKey,
            required: true,
        },
    },
    setup(props) {
        const confirmNameValue = ref<string>();

        return {
            confirmNameValue,

            canDelete: computed(() => confirmNameValue.value === props.apiKey.memo),

            confirm: () => {
                return useService('apiKeys@delete', 'admin.application_api.delete_api_key', {
                    id: props.apiKey.identifier,
                }).then(() => dispatch('lists/refresh', 'apiKeys@getAll'));
            }
        };
    }
});
</script>
