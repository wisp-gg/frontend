<template>
    <modal has-alerts title="admin.domains.delete_domain">
        <template #opener="{ open }">
            <v-button
                @click="open"
                color="danger"
                class="py-3 px-6"
                tooltip="generic.delete"
                permission="domain.delete"
            >
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t :path="['admin.domains.delete_notice', { name: domain.name }]" />

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
import { Domain } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        domain: {
            type: Domain,
            required: true,
        },
    },
    setup(props) {
        const confirmNameValue = ref<string>();

        return {
            confirmNameValue,

            canDelete: computed(() => confirmNameValue.value === props.domain.name),

            confirm: () => {
                return useService('domains@delete', 'admin.domains.delete_domain', {
                    id: props.domain.id
                }).then(() => dispatch('lists/refresh', 'domains@getAll'));
            }
        };
    }
});
</script>
