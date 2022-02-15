<template>
    <v-form class="space-y-4" service-id="servers@create" :on-success="onSuccess">
        <container title="admin.servers.new.core_details">
            <div class="flex flex-col lg:flex-row gap-x-4 gap-y-4">
                <div class="w-full lg:w-1/2">
                    <v-input name="name" rule="required" />
                    <v-model-select
                        service-id="users@getAll"

                        label="components.form.fields.server_owner"
                        name="owner_id"
                        label-prop="selectorName"
                        value-prop="id"
                        rule="required"
                    />
                </div>

                <div class="w-full lg:w-1/2">
                    <v-textarea name="description" />
                    <v-switch no-margin name="start_on_completion" :value="true" />
                </div>
            </div>
        </container>

        <container title="admin.servers.build_configuration.allocation_management">
            <div class="grid lg:grid-cols-3 gap-x-4 gap-y-4">
                <v-model-select
                    service-id="nodes@getAll"

                    label="components.form.fields.node"
                    footer="admin.servers.new.node_footer"
                    name="node_id"
                    label-prop="name"
                    value-prop="id"
                    rule="required"

                    v-model:value="selectedNode"
                />

                <v-select
                    label="components.form.fields.primary_allocation"
                    footer="admin.servers.new.primary_allocation_footer"
                    name="primary_allocation_id"

                    :options="fetchAllocations"

                    label-prop="connection"
                    value-prop="id"
                    searchable
                    no-translate
                    rule="required"
                />

                <v-select
                    label="components.form.fields.secondary_allocations"
                    footer="admin.servers.new.secondary_allocations_footer"
                    name="secondary_allocations_ids"

                    mode="tags"
                    :options="fetchAllocations"

                    label-prop="connection"
                    value-prop="id"
                    searchable
                    no-translate
                />
            </div>
        </container>

        <container title="admin.servers.build_configuration.feature_limits">
            <div class="grid lg:grid-cols-3 gap-x-4 gap-y-4">
                <v-input name="database_limit" footer="admin.servers.new.database_limit_footer" rule="integer" value="0" />
                <v-input name="allocation_limit" footer="admin.servers.new.allocation_limit_footer" rule="integer" value="0" />
                <v-input name="backup_megabytes_limit" footer="admin.servers.new.backup_megabytes_limit_footer" rule="required|integer" suffix="generic.units.megabytes" value="0" />
            </div>
        </container>

        <container title="admin.servers.build_configuration.resource_limits">
            <div class="grid lg:grid-cols-3 gap-x-4">
                <v-input name="cpu" footer="admin.servers.new.cpu_footer" rule="required|integer" :suffix="['_raw', '%']" value="0" />
                <v-input name="memory" footer="admin.servers.new.memory_footer" rule="required|integer" suffix="generic.units.megabytes" />
                <v-input name="swap" footer="admin.servers.new.swap_footer" rule="required|integer" suffix="generic.units.megabytes" value="0" />
                <v-input name="disk" footer="admin.servers.new.disk_footer" rule="required|integer" suffix="generic.units.megabytes" />

                <!-- TODO: Min/max validation rules (10-1000 here) -->
                <v-input label="components.form.fields.block_io_proportion" footer="admin.servers.new.io_footer" name="io" rule="required|integer" value="500" />
            </div>
        </container>

        <container title="admin.servers.startup.service_configuration">
            <div class="grid lg:grid-cols-2 gap-x-4 gap-y-4">
                <v-model-select
                    service-id="nests@getAllForSelector"

                    label="components.form.fields.egg"
                    name="egg_id"
                    label-prop="name"
                    value-prop="id"
                    group-label-prop="name"
                    group-options-prop="eggs"
                    rule="required"

                    v-model:value="selectedEgg"
                />

                <skeleton :content="16">
                    <v-input name="docker_image" :value="selectedEgg?.dockerImage" />
                </skeleton>

                <v-switch name="skip_scripts" footer="admin.servers.new.skip_scripts_footer" />
            </div>

            <skeleton :content="16">
                <v-input label="components.form.fields.startup_command" name="startup" rule="required" :value="selectedEgg?.startup" />
            </skeleton>

            <list v-if="selectedEgg" service-id="eggVariables@getAll" :data="{ nest: selectedEgg.nestId, egg: selectedEgg.id }">
                <template #results="{ results }">
                    <div class="flex flex-wrap flex-col lg:flex-row mt-4">
                        <div class="w-full lg:w-1/2 lg:odd:pr-3 lg:even:pl-3" v-for="(result, idx) of results" :key="idx">
                            <startup-variable class="mb-4" :variable="result" />
                        </div>
                    </div>
                </template>
            </list>
        </container>

        <div class="bg-primary-500 p-4 rounded-lg text-right">
            <v-submit color="primary">
                <t path="generic.create" />
            </v-submit>
        </div>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Egg, Node, Server } from '~/api/models';
import StartupVariable from './StartupVariable.vue';
import { useService } from '~/plugins';

export default defineComponent({
    components: { StartupVariable },
    setup() {
        const router = useRouter();

        const selectedNode = ref<Node>();
        const selectedEgg = ref<Egg>();

        return {
            selectedNode,
            selectedEgg,

            fetchAllocations: async (query: string) => {
                if (!selectedNode.value) return [];

                const res = await useService<ListResponse>('nodeAllocations@getAllForSelector', { background: true }, {
                    node: selectedNode.value!.id,
                    in_use: false,
                    ip_port: query
                });

                return res.data;
            },

            onSuccess: (server: Server) => {
                return router.push({
                    name: 'admin.management.servers.manage.about',
                    params: {
                        server: server.id,
                    }
                });
            },
        };
    }
});
</script>
