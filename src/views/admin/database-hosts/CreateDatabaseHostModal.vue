<template>
    <modal title="admin.database_hosts.create_host" permission="database_host.create" opener-color="primary" opener-text="generic.create">
        <template #default="{ close }">
            <v-form service-id="databaseHosts@create" :on-success="() => { close(); updateList() }">
                <v-input name="name" footer="admin.database_hosts.name_footer" rule="required" />

                <div class="grid lg:grid-cols-2 gap-x-4 gap-y-4">
                    <v-input name="host" footer="admin.database_hosts.host_footer" rule="required" />
                    <v-input name="port" footer="admin.database_hosts.port_footer" rule="required" type="number" />

                    <v-input name="username" footer="admin.database_hosts.username_footer" rule="required" />
                    <v-input name="password" footer="admin.database_hosts.password_footer" rule="required" type="password" />

                    <v-input name="phpmyadmin_url" footer="admin.database_hosts.phpmyadmin_url_footer" />
                    <v-model-select
                        service-id="nodes@getAll"

                        label="components.form.fields.node"
                        footer="admin.database_hosts.node_footer"
                        name="node_id"
                        label-prop="name"
                        value-prop="id"
                    />
                </div>

                <v-switch name="enable_phpmyadmin" footer="admin.database_hosts.phpmyadmin_footer" />

                <div class="text-right">
                    <v-submit color="primary" permission="database_host.create">
                        <t path="generic.create" />
                    </v-submit>
                </div>
            </v-form>
        </template>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dispatch } from '~/core';

export default defineComponent({
    setup() {
        return {
            updateList: () => dispatch('lists/refresh', 'databaseHosts@getAll'),
        };
    },
});
</script>
