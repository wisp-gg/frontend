<template>
    <div>
        <list service-id="startup@getAll" :per-page="12" :skeletons="6" @meta="onMeta">
            <template #results="{ results }">
                <container title="server.startup.startup_command">
                    <input class="input" id="startup_command" v-clipboard="startupCommand" :value="startupCommand" readonly>
                </container>

                <div class="flex flex-wrap flex-col lg:flex-row mt-4">
                    <div class="w-full lg:w-1/2 lg:odd:pr-3 lg:even:pl-3" v-for="(result, idx) of results" :key="idx">
                        <startup-variable :variable="result" />
                    </div>
                </div>
            </template>
        </list>
    </div>
</template>

<script lang="ts">
import { defineComponent, provide, ref } from 'vue';
import StartupVariable from './StartupVariable.vue';

export default defineComponent({
    components: { StartupVariable },

    setup() {
        const startupCommand = ref<string>('');

        provide('updateStartupCommand', (newCommand: string) => {
            startupCommand.value = newCommand;
        });

        return {
            startupCommand,

            onMeta: (meta: ListResponseMeta) => {
                startupCommand.value = meta.startupCommand;
            }
        };
    },
});
</script>
