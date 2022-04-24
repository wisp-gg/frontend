<template>
    <modal has-alerts title="server.databases.delete_database" permission="database.delete">
        <template #opener="{ open }">
            <v-button @click="open" v-tippy="'generic.delete'" color="danger" class="py-3 px-6">
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t :path="['server.databases.delete_database_notice', { name: database.name }]" />

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
import { ServerDatabase } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        database: {
            type: ServerDatabase,
            required: true,
        },
    },
    setup(props) {
        const confirmNameValue = ref<string>();

        return {
            confirmNameValue,

            canDelete: computed(() => confirmNameValue.value === props.database.name),

            confirm: () => {
                return useService('databases@delete', 'server.databases.delete_database', {
                    id: props.database.id
                }).then(() => state.lists.refresh('databases@getAll'));
            }
        };
    }
});
</script>
