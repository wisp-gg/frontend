<template>
    <list service-id="mods@get" :fields="listFields">
        <template #headers-after>
            <th />
        </template>

        <template #fields-after="{ result }">
            <th class="p-6 text-right">
                <skeleton :content="6">
                    <!-- TODO: Improve this somehow so it doesnt call the function 5 times... mod-row component? -->
                    <v-button
                        v-if="result.serverStateInfo()"
                        :color="result.serverStateInfo()[1]"
                        :disabled="result.serverStateInfo()[2]"
                        permission="mod.update"
                        @click="toggleModInstall(result)"
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
import Accordion from '~/components/Accordion.vue';
import { Mod } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    components: { Accordion },
    setup() {
        return {
            toggleModInstall: (mod: Mod) => {
                if ([1, 3].includes(mod.serverState)) return;

                return useService('mods@toggle', true, { id: mod.id });
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
