<template>
    <div class="grid lg:grid-cols-3 gap-x-4 gap-y-4 items-start">
        <container title="admin.servers.advanced.reinstall_server">
            <t path="admin.servers.advanced.reinstall_server_note" />

            <v-button class="w-full mt-4" color="danger" permission="server.reinstall" @click="reinstall">
                <t path="generic.reinstall" />
            </v-button>
        </container>

        <container title="admin.servers.advanced.install_status">
            <t path="admin.servers.advanced.install_status_note" />

            <v-button class="w-full mt-4" color="info" permission="server.toggle_install" @click="toggleInstall">
                <t path="generic.toggle" />
            </v-button>
        </container>

        <container title="admin.servers.advanced.rebuild_container">
            <t path="admin.servers.advanced.rebuild_container_note" />

            <v-button class="w-full mt-4" color="primary" permission="server.rebuild" @click="rebuild">
                Rebuild Server Container
            </v-button>
        </container>

        <container title="admin.servers.advanced.suspend_server">
            <t path="admin.servers.advanced.suspend_server_note" />

            <skeleton :content="16">
                <v-button class="w-full mt-4" color="warning" permission="server.suspend" @click="suspend">
                    <t :path="`generic.${server.suspended ? 'unsuspend' : 'suspend'}`" />
                </v-button>
            </skeleton>
        </container>

        <container title="admin.servers.advanced.updating_status">
            <t path="admin.servers.advanced.updating_status_note" />

            <v-button class="w-full mt-4" color="info" permission="server.toggle_update" @click="toggleUpdate">
                <t path="generic.toggle" />
            </v-button>
        </container>

        <container title="admin.servers.advanced.move_server">
            <v-form service-id="servers@move">
                <v-model-select
                    name="location_id"
                    label="components.form.fields.location"
                    service-id="locations@getAll"

                    label-prop="long"
                    value-prop="id"

                    rule="required"
                />

                <skeleton :content="16">
                    <v-model-select
                        name="node_id"
                        label="components.form.fields.node"
                        service-id="nodes@getAll"

                        label-prop="name"
                        value-prop="id"
                    />
                </skeleton>

                <v-submit class="w-full" color="danger" permission="server.move">
                    Move server
                </v-submit>
            </v-form>
        </container>

        <container title="admin.servers.advanced.moving_status">
            <t path="admin.servers.advanced.moving_status_note" />

            <v-button class="w-full mt-4" color="warning" permission="server.toggle_move" @click="toggleMove">
                <t path="generic.toggle" />
            </v-button>
        </container>

        <container title="admin.servers.advanced.reset_mod_statuses">
            <t path="admin.servers.advanced.reset_mod_statuses_note" />

            <v-button class="w-full mt-4" color="danger" permission="server.reset_mods" @click="resetMods">
                <t path="generic.reset" />
            </v-button>
        </container>

        <container title="admin.servers.advanced.toggle_backup_status">
            <v-form service-id="serverBackups@toggle">
                <skeleton :content="16">
                    <v-model-select
                        name="id"
                        label="components.form.fields.backup"
                        service-id="serverBackups@getAll"

                        label-prop="name"
                        value-prop="id"

                        rule="required"
                    />
                </skeleton>

                <v-submit class="w-full" color="info" permission="server.toggle_backup">
                    <t path="generic.toggle" />
                </v-submit>
            </v-form>
        </container>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';
import { useService } from '~/plugins';

export default defineComponent({
    setup() {
        return {
            server: computed(() => state.models.server!),

            reinstall: () => useService('servers@reinstall', true).then(() => {
                // TODO: Alert
            }),

            toggleInstall: () => useService('servers@toggleInstall', true).then(() => {
                // TODO: Alert
            }),

            rebuild: () => useService('servers@rebuild', true).then(() => {
                // TODO: Alert
            }),

            suspend: () => useService('servers@suspend', true, { suspended: !state.models.server!.suspended }).then(() => {
                // TODO: Alert
            }),

            toggleUpdate: () => useService('servers@toggleUpdate', true).then(() => {
                // TODO: Alert
            }),

            toggleMove: () => useService('servers@toggleMove', true).then(() => {
                // TODO: Alert
            }),

            resetMods: () => useService('servers@resetMods', true).then(() => {
                // TODO: Alert
            }),
        };
    }
});
</script>
