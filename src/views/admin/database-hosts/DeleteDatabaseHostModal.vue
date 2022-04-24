<template>
    <modal has-alerts title="admin.database_hosts.delete_host">
        <template #opener="{ open }">
            <v-button @click="open" v-tippy="'generic.delete'" permission="database_host.delete" color="danger" class="py-3 px-6">
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t :path="['admin.database_hosts.delete_notice', { name: host.name }]" />

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
import state from '~/state';
import { DatabaseHost } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        host: {
            type: DatabaseHost,
            required: true,
        },
    },
    setup(props) {
        const confirmNameValue = ref<string>();

        return {
            confirmNameValue,

            canDelete: computed(() => confirmNameValue.value === props.host.name),

            confirm: () => {
                return useService('databaseHosts@delete', 'admin.database_hosts.delete_host', {
                    id: props.host.id
                }).then(() => state.lists.refresh('databaseHosts@getAll'));
            }
        };
    }
});
</script>
