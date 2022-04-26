<template>
    <skeleton-context when="ModelBindings@server">
        <v-form service-id="servers@updateBuild" class="flex flex-col lg:flex-row items-start gap-x-4 gap-y-4">
            <container class="w-full lg:w-1/3" title="admin.servers.build_configuration.resource_limits">
                <v-input name="cpu" rule="required|integer" :suffix="['_raw', '%']" :value="server?.limits.cpu" />
                <v-input name="memory" rule="required|integer" suffix="generic.units.megabytes" :value="server?.limits.memory" />
                <v-input name="swap" rule="required|integer" suffix="generic.units.megabytes" :value="server?.limits.swap" />
                <v-input name="disk" rule="required|integer" suffix="generic.units.megabytes" :value="server?.limits.disk" />
                <v-input label="components.form.fields.block_io_proportion" name="io" rule="required|integer" :value="server?.limits.io" />
                <v-switch name="oom_disabled" footer="admin.servers.build_configuration.oom_disabled_footer" :value="server?.oomDisabled" />

            </container>

            <div class="w-full lg:w-2/3 space-y-4">
                <container title="admin.servers.build_configuration.feature_limits">
                    <div class="grid lg:grid-cols-2 gap-x-4">
                        <v-input name="database_limit" rule="integer" :value="server?.featureLimits.databases" />
                        <v-input name="allocation_limit" rule="integer" :value="server?.featureLimits.allocations" />
                        <v-input no-margin name="backup_megabytes_limit" rule="integer" suffix="generic.units.megabytes" :value="server?.featureLimits.backupMegabytes" />
                    </div>
                </container>

                <container title="admin.servers.build_configuration.allocation_management">
                    <skeleton :content="16">
                        <v-select
                            label="components.form.fields.primary_allocation"
                            name="allocation_id"

                            :options="server?.allocations"
                            :value="server?.primaryAllocation().id"
                            label-prop="connection"
                            value-prop="id"
                            searchable
                            rule="required"
                        />
                    </skeleton>


                    <skeleton :content="16">
                        <v-select
                            label="components.form.fields.add_allocations"
                            name="add_allocation_ids"
                            mode="tags"

                            :options="fetchAllocations"
                            label-prop="connection"
                            value-prop="id"
                            searchable
                        />
                    </skeleton>

                    <skeleton :content="16">
                        <v-select
                            label="components.form.fields.remove_allocations"
                            name="remove_allocation_ids"
                            mode="tags"

                            :options="secondaryAllocations"
                            label-prop="connection"
                            value-prop="id"
                            searchable
                        />
                    </skeleton>
                </container>

                <div class="bg-primary-500 p-4 rounded text-right space-x-4">
                    <skeleton :content="6">
                        <v-submit no-margin color="primary" permission="server.build_update">
                            <t path="generic.submit" />
                        </v-submit>
                    </skeleton>
                </div>
            </div>
        </v-form>
    </skeleton-context>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';
import { useService } from '~/plugins';

export default defineComponent({
    setup() {
        const fetchAllocations = async (query: string) => {
            if (!state.models.server?.node) return [];

            const res = await useService<any>('nodeAllocations@getAllForSelector', { background: true }, {
                node: state.models.server.node.id,
                in_use: false,
                ip_port: query
            });

            return res.data;
        };

        return {
            server: computed(() => state.models.server!),

            secondaryAllocations: computed(() => {
                return state.models.server?.allocations.filter(r => !r.primary) ?? [];
            }),

            fetchAllocations,
        };
    }
});
</script>
