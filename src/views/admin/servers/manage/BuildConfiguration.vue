<template>
    <v-form service-id="servers@updateBuild" class="flex flex-col lg:flex-row items-start gap-x-4 gap-y-4">
        <container class="w-full lg:w-1/3" title="admin.servers.build_configuration.resource_limits">
            <v-input name="cpu" rule="required|integer" :suffix="['_raw', '%']" :value="server?.limits.cpu" />
            <v-input name="memory" rule="required|integer" suffix="generic.units.megabytes" :value="server?.limits.memory" />
            <v-input name="swap" rule="required|integer" suffix="generic.units.megabytes" :value="server?.limits.swap" />
            <v-input name="disk" rule="required|integer" suffix="generic.units.megabytes" :value="server?.limits.disk" />
            <v-input no-margin label="components.form.fields.block_io_proportion" name="io" rule="required|numeric" :value="server?.limits.io" />
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

                        :options="server.allocations"
                        :value="server.primaryAllocation().id"
                        label-prop="connection"
                        value-prop="id"
                        searchable
                        rule="required"
                    />
                </skeleton>


                <!-- TODO: Pull un-used allocations from node -->
                <skeleton :content="16">
                    <v-select
                        label="components.form.fields.secondary_allocations"
                        name="secondary_allocation_ids"
                        mode="tags"

                        :options="secondaryAllocations"
                        :value="secondaryAllocations.map(r => r.id)"
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
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';

export default defineComponent({
    setup() {
        return {
            server: computed(() => state.models.server!),

            secondaryAllocations: computed(() => {
                return state.models.server?.allocations.filter(r => !r.primary) ?? [];
            }),
        };
    }
});
</script>
