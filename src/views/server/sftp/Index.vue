<template>
    <container title="server.sftp.sftp_details">
        <div class="flex items-center gap-x-20">
            <div class="flex-grow space-y-8">
                <div>
                    <label class="text-white opacity-50 tracking-wide uppercase block mb-3" for="address">
                        <t path="components.form.fields.connection_address" />
                    </label>

                    <div class="flex">
                        <input class="input flex-grow mr-3" id="address" v-clipboard="address" :value="address" readonly>

                        <v-button color="info" :href="address">
                            <t path="generic.server.launch_sftp" />
                        </v-button>
                    </div>
                </div>

                <div>
                    <label class="text-white opacity-50 tracking-wide uppercase block mb-3" for="name">
                        <t path="components.form.fields.username" />
                    </label>

                    <input class="input" id="name" v-clipboard="name" :value="name" readonly>
                </div>

                <alert type="info" icon="info-circle" title="server.sftp.alert_note" />
            </div>

            <div class="hidden lg:block">
                <img class="w-80" :src="folder" />
            </div>
        </div>
    </container>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';
import folder from '~/assets/svg/undraw/folder.svg';

export default defineComponent({
    setup() {
        return {
            folder,
            address: computed(() => {
                const server = state.models.server;

                return server ? `sftp://${server.node.displayFqdn}:${server.node.ports.sftp}` : undefined;
            }),
            name: computed(() => {
                const user = state.user.data;
                const server = state.models.server;

                return server ? `${user?.email}.${server.uuidShort}` : undefined;
            }),
        };
    },
});
</script>
