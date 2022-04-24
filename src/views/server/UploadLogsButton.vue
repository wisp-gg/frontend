<template>
    <modal title="server.logs.upload_logs">
        <template #opener="{ open }">
            <v-button v-tippy="'server.console.upload_logs'" permission="control.console" class="p-4 hover:text-white" @click="open">
                <fa :icon="['fas', 'upload']" size="lg" />
            </v-button>
        </template>

        <template #default="{ close }">
            <div class="flex items-center">
                <p class="flex-grow text-md">
                    <t path="server.logs.upload_logs_description" />
                </p>

                <!-- TODO: Cleaner way to submit & close, (preferably show spinner in modal until submitting is finished first) -->
                <v-button color="primary" @click="close(); upload()">
                    <t path="server.logs.upload_logs" />
                </v-button>
            </div>
        </template>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import state from '~/state';
import { triggerDaemonAction, useDaemonEvent } from '~/plugins';

export default defineComponent({
    setup() {
        return {
            upload: () => {
                const finished = useDaemonEvent('upload-logs', data => {
                    finished();

                    if (data.url) {
                        state.alerts.add({
                            type: 'success',
                            title: ['server.logs.upload_complete', { url: data.url }],
                        });
                    } else {
                        state.alerts.add({
                            type: 'danger',
                            title: ['server.logs.upload_failed'],
                        });
                    }
                });

                triggerDaemonAction('upload-logs');
            },
        };
    }
});
</script>
