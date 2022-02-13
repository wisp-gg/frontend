<template>
    <div class="btn-group justify-center">
        <v-button permission="control.start" color="success" class="mt-4 px-5 py-2" :disabled="!connected || !off" @click="sendPowerAction('start')">
            <t path="server.power.start" />
        </v-button>

        <v-button permission="control.restart" color="info" class="mt-4 px-5 py-2" :disabled="!connected || (!on && !starting)" @click="sendPowerAction('restart')">
            <t path="server.power.restart" />
        </v-button>

        <v-button permission="control.stop" color="warning" class="mt-4 px-5 py-2" :disabled="!connected || (!on && !starting)" @click="sendPowerAction('stop')">
            <t path="server.power.stop" />
        </v-button>
        <v-button permission="control.stop" color="danger" class="mt-4 px-5 py-2" :disabled="!connected || (!on && !starting && !stopping)" @click="sendPowerAction('kill')">
            <t path="server.power.kill" />
        </v-button>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { state } from '~/core';
import { PowerActionType, ServerStatus } from '~/api/services/daemon/types';
import { triggerDaemonAction } from '~/plugins';

export default defineComponent({
    setup() {
        return {
            connected: computed(() => state.server.socket.connected),
            on: computed(() => state.server.socket.status === ServerStatus.ON),
            off: computed(() => state.server.socket.status === ServerStatus.OFF),
            starting: computed(() => state.server.socket.status === ServerStatus.STARTING),
            stopping: computed(() => state.server.socket.status === ServerStatus.STOPPING),
            sendPowerAction(action: PowerActionType) {
                triggerDaemonAction('send-power', action);
            }
        };
    },
});
</script>
