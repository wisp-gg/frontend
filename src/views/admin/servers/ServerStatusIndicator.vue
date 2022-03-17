<template>
    <status-indicator :status="stats.status" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';
import { Server } from '~/api/models';
import { ServersService } from '~/api/services/client';
import { ServerStats } from '~/api/services/client/servers';
import StatusIndicator from '~/views/StatusIndicator.vue';

export default defineComponent({
    components: { StatusIndicator },

    props: {
        server: {
            type: Server,
            required: true,
        },
    },

    setup(props) {
        const stats = ref<ServerStats>({
            status: -2,
        });

        let registered = false;
        const register = (server?: Server) => {
            if (registered || !server) return;

            ServersService.registerStats(
                server.uuidShort,
                serverStats => stats.value = serverStats,
            );
            registered = true;
        };

        const unregister = (server?: Server) => {
            if (!registered || !server) return;

            ServersService.unregisterStats(server.uuidShort);
            registered = false;
        };

        onMounted(() => register(props.server));
        watch(() => props.server, (newServer?: Server, oldServer?: Server) => {
            unregister(oldServer);
            stats.value = {
                status: -2,
            };
            register(newServer);
        });
        onUnmounted(() => unregister(props.server));

        return {
            stats,
        };
    },
});
</script>
