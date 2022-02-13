<template>
    <modal title="admin.database_hosts.create_host" permission="database_host.create" opener-color="primary" opener-text="generic.create">
        <template #default="{ close }">
            <v-form service-id="databaseHosts@create" :on-success="() => { close(); updateList() }">
                <v-input name="name" footer="admin.database_hosts.name_footer" rule="required" />

                <div class="flex flex-col lg:flex-row lg:space-x-4">
                    <v-input class="w-full lg:w-1/2" name="host" footer="admin.database_hosts.host_footer" rule="required" />
                    <v-input class="w-full lg:w-1/2" name="port" footer="admin.database_hosts.port_footer" rule="required" type="number" />
                </div>

                <div class="flex space-x-4">
                    <v-input class="w-full lg:w-1/2" name="username" footer="admin.database_hosts.username_footer" rule="required" />
                    <v-input class="w-full lg:w-1/2" name="password" footer="admin.database_hosts.password_footer" rule="required" type="password" />
                </div>

                <v-switch name="enable_phpmyadmin" footer="admin.database_hosts.phpmyadmin_footer" />
                <v-input name="display_fqdn" footer="admin.database_hosts.display_fqdn_footer" />

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
