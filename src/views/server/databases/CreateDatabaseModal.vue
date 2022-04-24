<template>
    <modal has-alerts title="server.databases.create_new" permission="database.create" opener-text="generic.create" v-slot="{ close }">
        <v-form service-id="databases@create" :on-success="() => { close(); updateList(); }">
            <v-select
                name="host"
                footer="server.databases.host_footer"

                value="local"
                :options="fetchDatabaseHosts"
                label-prop="name"
                value-prop="id"
                searchable
                rule="required"
            />

            <v-input name="name" footer="server.databases.name_footer" rule="required" />

            <v-input name="connections_from" footer="server.databases.connections_from_footer" rule="required" value="%" />

            <div class="text-right space-x-4">
                <v-submit color="primary" permission="database.create" label="generic.submit" />
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import state from '~/state';
import { useService } from '~/plugins';

export default defineComponent({
    setup() {
        return {
            updateList: () => state.lists.refresh('databases@getAll'),

            async fetchDatabaseHosts() {
                return useService<ListResponse>('databaseHosts@get', {
                    displayErrorsInUI: 'server.databases.create_new',
                    background: true,
                }).then(a => a.data);
            }
        };
    }
});
</script>
