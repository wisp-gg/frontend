<template>
    <modal has-alerts title="server.databases.create_new" permission="database.create" opener-text="generic.create">
        <v-form service-id="databases@create">
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
import { useService } from '~/plugins';

export default defineComponent({
    setup() {
        return {
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
