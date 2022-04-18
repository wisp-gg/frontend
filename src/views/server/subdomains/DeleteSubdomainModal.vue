<template>
    <modal has-alerts title="server.subdomains.delete_subdomain" permission="subdomain.delete">
        <template #opener="{ open }">
            <v-button @click="open" v-tippy="'generic.delete'" color="danger" class="py-3 px-6">
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t :path="['server.subdomains.delete_subdomain_notice', { name: subdomain.displayName }]" />

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
import { ServerSubdomain } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        subdomain: {
            type: ServerSubdomain,
            required: true,
        },
    },
    setup(props) {
        const confirmNameValue = ref<string>();

        return {
            confirmNameValue,

            canDelete: computed(() => confirmNameValue.value === props.subdomain.displayName),

            confirm: () => {
                return useService('subdomains@delete', 'server.subdomains.delete_subdomain', {
                    id: props.subdomain.id
                }).then(() => dispatch('lists/refresh', 'subdomains@getAll'));
            }
        };
    }
});
</script>
