<template>
    <modal no-opener v-model="modalOpen" title="server.console.eula_acceptance">
        <div class="flex items-center">
            <p class="flex-grow text-md">
                <!-- TODO: Ability to add a link to a locale string (Mojang EULA = https://account.mojang.com/documents/minecraft_eula) -->
                <t path="server.console.eula_notice" />
            </p>

            <v-button color="primary" class="px-8 py-2" @click="acceptEula()" spinner>
                <t path="generic.accept" />
            </v-button>
        </div>
    </modal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { triggerDaemonAction, useDaemonEvent, useService } from '~/plugins';

export default defineComponent({
    setup() {
        const modalOpen = ref(false);

        useDaemonEvent('console-output', data => {
            if (!data.line.toLowerCase().includes('you need to agree to the eula in order to run the server')) return;

            modalOpen.value = true;
        });

        return {
            acceptEula: async () => {
                await useService('files@writeFile', 'server.console.eula_acceptance', {
                    path: 'eula.txt',
                    content: 'eula=true'
                });

                triggerDaemonAction('send-power', 'restart');

                modalOpen.value = false;
            },

            modalOpen,
        };
    }
});
</script>
