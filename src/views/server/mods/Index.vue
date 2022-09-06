<template>
    <list service-id="mods@get" :fields="listFields">
        <template #headers-after>
            <th />
        </template>

        <template #fields-after="{ result }">
            <th class="p-6 text-right">
                <skeleton :content="6">
                    <!-- TODO: UX kinda sucks here, waiting for mod to install before giving any feedback - implement a button spinner or something -->
                    <v-button
                        v-if="result.serverStateInfo()"
                        :color="result.serverStateInfo()[1]"
                        :disabled="result.serverStateInfo()[2]"
                        permission="mod.update"
                        @click="toggleModInstall(result)"
                        spinner
                    >
                        <t :path="`server.mods.states.${result.serverStateInfo()[0]}`" />
                    </v-button>
                </skeleton>
            </th>
        </template>
    </list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dispatch } from '~/core';
import { useService, refreshList } from '~/plugins';
import { Mod } from '~/api/models';
import { ModState } from '~/api/models/Mod';

export default defineComponent({
    setup() {
        return {
            toggleModInstall: async (mod: Mod) => {
                if ([ModState.Installing, ModState.Uninstalling].includes(mod.serverState)) return;

                await useService('mods@toggle', true, { id: mod.id });

                await refreshList('mods@get');
                dispatch('alerts/add', {
                    type: 'success',
                    title: [`server.mods.mod_${mod.serverState === ModState.Installed ? 'uninstalled' : 'installed'}`, { name: mod.name }]
                });
            },

            listFields: <ListField[]>[
                { key: 'name', skeleton: 8 },
                { key: 'description', skeleton: 12 },
                { key: 'category', skeleton: 8 },
                { key: 'version', features: ['code'], skeleton: 6 }
            ]
        };
    }
});
</script>
