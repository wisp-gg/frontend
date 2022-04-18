<template>
    <container title="server.databases.title" :description="['server.databases.using_databases', { count: databaseCount, limit: databaseLimit === null ? '∞' : databaseLimit }]" no-padding>
        <template #actions>
            <div class="text-right">
                <create-database-modal />
            </div>
        </template>

        <list service-id="databases@getAll" :fields="listFields" @meta="onMeta">
            <template #headers-after>
                <th />
            </template>

            <template #field-connection="{ result }">
                <code v-clipboard>{{ result.host.connection() }}</code>
            </template>

            <template #fields-after="{ result }">
                <td class="p-6 text-right">
                    <div class="flex justify-end space-x-4">
                        <skeleton :content="12">
                            <form v-if="result.host.enablePhpmyadmin" :action="result.host.phpmyadminUrl()" method="post" target="_blank">
                                <input type="hidden" id="pma_username" name="pma_username" :value="result.username">
                                <input type="hidden" id="pma_password" name="pma_password" :value="result.password">

                                <v-button type="submit" color="primary" class="py-3 px-6">
                                    <t path="server.databases.phpmyadmin" />
                                </v-button>
                            </form>
                        </skeleton>

                        <skeleton :content="8">
                            <v-button color="warning" permission="database.update" class="py-3 px-6" @click="rotatePassword(result.id)">
                                <t path="generic.reset_password" />
                            </v-button>
                        </skeleton>

                        <skeleton :content="4">
                            <delete-database-modal :database="result" />
                        </skeleton>
                    </div>
                </td>
            </template>
        </list>
    </container>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { state, dispatch } from '~/core';
import { useService } from '~/plugins';
import CreateDatabaseModal from './CreateDatabaseModal.vue';
import DeleteDatabaseModal from './DeleteDatabaseModal.vue';

export default defineComponent({
    components: { CreateDatabaseModal, DeleteDatabaseModal },
    setup() {
        const databaseCount = ref(0);

        return {
            onMeta: (results: ListResponseMeta) => databaseCount.value = results.pagination.total,

            databaseLimit: computed(() => state.models.server?.featureLimits.databases || 0),
            databaseCount,

            rotatePassword: (id: number) => {
                return useService('databases@rotatePassword', true, {
                    id
                })
                    .then(() => dispatch('lists/refresh', 'databases@getAll'));
            },

            listFields: <ListField[]>[
                { key: 'name', skeleton: 6 },
                { key: 'username', features: ['clipboard', 'code'], skeleton: 12 },
                { key: 'password', features: ['clipboard', 'code', 'secret'], skeleton: 12 },
                { key: 'connection', skeleton: 12 },
            ],
        };
    },
});
</script>
