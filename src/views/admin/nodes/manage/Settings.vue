<template>
    <v-form service-id="nodes@update">
        <div class="flex flex-col lg:flex-row lg:space-x-4 gap-y-4">
            <div class="w-full lg:w-1/2">
                <container title="generic.settings">
                    <v-input name="name" rule="required" :value="node?.name" />
                    <v-textarea name="description" rule="required" :value="node?.description" />

                    <skeleton :content="16">
                        <v-model-select
                            service-id="locations@getAll"

                            label="components.form.fields.location"
                            name="location_id"

                            label-prop="short"
                            value-prop="id"

                            :value="node.location"
                            rule="required"
                        />
                    </skeleton>

                    <v-input name="fqdn" :value="node?.connection.fqdn" readonly />
                    <v-input name="display_fqdn" footer="admin.nodes.settings.display_fqdn_footer" :value="node?.connection.display" />

                    <v-switch name="public" label="admin.nodes.settings.allow_automatic_allocation" footer="admin.nodes.settings.automatic_allocation_footer" :value="node?.public" />
                    <v-switch name="behind_proxy" footer="admin.nodes.settings.behind_proxy_footer" :value="node?.connection.behindProxy" />
                    <v-switch no-margin name="maintenance_mode" footer="admin.nodes.settings.maintenance_mode_footer" :value="node?.maintenanceMode" />
                </container>
            </div>

            <div class="w-full lg:w-1/2">
                <container title="generic.limits">
                    <div class="grid grid-cols-2 gap-x-4">
                        <v-input name="cpu" footer="admin.nodes.settings.cpu_footer" rule="required" :value="node?.limits.cpu" :suffix="['_raw', '%']" />
                        <v-input name="cpu_overallocate" label="components.form.fields.overallocate" :value="node?.limits.cpuOverallocate" :suffix="['_raw', '%']" />

                        <v-input name="memory" footer="admin.nodes.settings.memory_footer" rule="required" :value="node?.limits.memory" suffix="generic.units.megabytes" />
                        <v-input name="memory_overallocate" label="components.form.fields.overallocate" :value="node?.limits.memoryOverallocate" :suffix="['_raw', '%']" />

                        <v-input no-margin name="disk" footer="admin.nodes.settings.disk_footer" rule="required" :value="node?.limits.disk" suffix="generic.units.megabytes" />
                        <v-input no-margin name="disk_overallocate" label="components.form.fields.overallocate" :value="node?.limits.diskOverallocate" :suffix="['_raw', '%']" />
                    </div>
                </container>

                <container title="admin.nodes.settings.general_configuration" class="my-4">
                    <v-input name="upload_size" label="admin.nodes.settings.max_web_upload" footer="admin.nodes.settings.max_web_upload_footer" rule="required|min:0|max:1000" :value="node?.uploadSize" suffix="generic.units.megabytes" />

                    <div class="grid grid-cols-2 gap-x-4">
                        <v-input name="daemon_listen" label="admin.nodes.settings.daemon_port" rule="required" :value="node?.ports.base" />
                        <v-input name="daemon_sftp" label="admin.nodes.settings.sftp_port" rule="required" :value="node?.ports.sftp" />
                        <v-input no-margin name="daemon_fastdl" label="admin.nodes.settings.fastdl_port" rule="required" :value="node?.ports.fastdl" />
                    </div>
                </container>

                <div class="bg-primary-500 p-4 rounded text-right space-x-4">
                    <skeleton :content="8">
                        <v-submit color="primary" permission="node.update">
                            <t path="generic.save" />
                        </v-submit>
                    </skeleton>
                </div>
            </div>
        </div>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import state from '~/state';
import { useService } from '~/plugins';

export default defineComponent({
    setup() {
        return {
            node: computed(() => state.models.node),

            fetchLocations: (query: string) => {
                return useService<ListResponse>('locations@getAll', true, {
                    ['filter[short]']: query
                }).then(listData => {
                    return listData.data.map((location: any) => ({
                        id: location.id,
                        short: location.short
                    }));
                });
            }
        };
    }
});
</script>
