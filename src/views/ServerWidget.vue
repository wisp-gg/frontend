<template>
    <div class="flex items-start bg-primary-900" :class="preference === 0 ? 'px-6 py-3' : 'px-4 py-2 rounded-l-lg'">
        <div class="overflow-hidden">
            <p class="line-clamp-1 max-w-lg">
                {{ server?.name }}
            </p>
            <p v-clipboard class="text-sm text-white text-opacity-40">
                {{ server?.primaryAllocation()?.displayName() }}
            </p>
        </div>
        <status-indicator :class="preference === 0 ? 'ml-auto' : 'ml-auto md:ml-8'" :status="status" />
    </div>

    <div class="flex flex-wrap px-6 py-3 text-sm" :class="preference === 0 ? '' : 'md:min-w-40 md:border md:border-l-0 md:border-primary-700 md:rounded-r-lg'">
        <p class="text-left w-1/2">
            <span v-tippy="'generic.server.cpu'">
                <fa :icon="['fas', 'tachometer-alt']" size="sm" fixed-width />
            </span>
            {{ cpu }}
        </p>
        <p class="w-1/2" :class="preference === 0 ? 'text-left' : 'md:text-right'">
            <span v-tippy="'generic.server.memory'">
                <fa :icon="['fas', 'memory']" size="sm" fixed-width />
            </span>
            {{ memory }}
        </p>
        <p class="text-left w-1/2">
            <span v-tippy="'generic.server.disk'">
                <fa :icon="['fas', 'hdd']" size="sm" fixed-width />
            </span>
            {{ disk }}
        </p>
        <p class="w-1/2" :class="preference === 0 ? 'text-left' : 'md:text-right'">
            <span v-tippy="'generic.server.players'">
                <fa :icon="['fas', 'user']" size="sm" fixed-width />
            </span>
            {{ players }}
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { state } from '~/core';
import { bytesToString } from '~/helpers';
import StatusIndicator from '~/views/StatusIndicator.vue';
import { NavBarPosition } from '~/api/models/User';

export default defineComponent({
    components: { StatusIndicator },
    setup() {
        const { t } = useI18n();

        const server = state.models.server;
        const socket = state.server.socket;

        return {
            server,
            preference: computed(() => state.user.data?.preferences?.navbarPosition || NavBarPosition.LEFT),
            status: computed(() => socket.status),
            cpu: computed(() => socket.proc?.cpuUsed ? `${socket.proc.cpuUsed?.toFixed(2)}%` : '--'),
            memory: computed(() => {
                if (socket.proc) {
                    const [value, unit] = bytesToString(socket.proc.memoryUsed);
                    return `${value} ${t(`generic.units.${unit}`)}`;
                }

                return '--';
            }),
            disk: computed(() => {
                if (socket.proc) {
                    const [value, unit] = bytesToString(socket.proc.diskUsed);
                    return `${value} ${t(`generic.units.${unit}`)}`;
                }

                return '--';
            }),
            players: computed(() => socket.query ? socket.query.players.length : '--'),
        };
    },
});
</script>
