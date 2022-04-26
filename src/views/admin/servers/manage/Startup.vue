<template>
    <v-form service-id="serverStartup@update">
        <container title="admin.servers.startup.command_modification">
            <skeleton :content="16">
                <v-input name="startup" label="components.form.fields.startup_command" :value="server.startup" />
            </skeleton>

            <skeleton :content="16">
                <v-input name="default_startup_command" :value="selectedEgg.startup" readonly />
            </skeleton>

            <div class="text-right">
                <v-submit color="primary">
                    <t path="generic.save" />
                </v-submit>
            </div>
        </container>

        <container class="mt-4" title="admin.servers.startup.service_configuration">
            <div class="grid lg:grid-cols-2 gap-x-4 gap-y-4">
                <skeleton :content="16">
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
                </skeleton>

                <skeleton :content="16">
                    <v-input name="docker_image" :value="image" />
                </skeleton>

                <v-switch name="skip_scripts" />
            </div>

            <list v-if="selectedEgg" service-id="eggVariables@getAll" :data="{ nest: selectedEgg.nestId, egg: selectedEgg.id }" >
                <template #results="{ results }">
                    <skeleton-context when="eggVariables@getAll">
                        <div class="flex flex-wrap flex-col lg:flex-row mt-4">
                            <div class="w-full lg:w-1/2 lg:odd:pr-3 lg:even:pl-3" v-for="(result, idx) of results" :key="idx">
                                <startup-variable class="mb-4" :variable="result" :server-value="serverVariables?.find(r => r.id === result?.id)?.serverValue" />
                            </div>
                        </div>
                    </skeleton-context>
                </template>
            </list>
        </container>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { state } from '~/core';
import { onModelLoaded, useService } from '~/plugins';
import { Egg, ServerVariable } from '~/api/models';
import StartupVariable from '../StartupVariable.vue';

export default defineComponent({
    components: { StartupVariable },
    setup() {
        const serverVariables = ref<ServerVariable[]>([]);

        const selectedEgg = ref<Egg>();
        onModelLoaded('server', server => {
            selectedEgg.value = server.egg;

            useService<ListResponse>('serverStartup@getAll', true).then(variables => serverVariables.value = variables.data as any[]);
        });

        return {
            serverVariables,
            selectedEgg,
            server: computed(() => state.models.server!),
            image: computed(() => selectedEgg.value?.id === state.models.server?.egg.id ? state.models.server?.image : selectedEgg.value?.dockerImage),
        };
    }
});
</script>
