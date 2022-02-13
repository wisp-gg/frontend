<template>
    <div class="w-full lg:w-1/2 lg:even:pl-3 lg:odd:pr-3">
        <div class="server flex flex-col text-center overflow-hidden whitespace-nowrap" :style="`--thumbnail:url('${server?.egg?.thumbnail || minecraft}');`">
            <div class="gradient" />
            <div class="flex items-center bg-primary-900 bg-opacity-25 px-8 py-4">
                <div class="self-start mt-1 mr-2">
                    <span v-if="!server || stats.status === -2" class="text-accent-500">
                        <fa :icon="['fas', 'spinner']" spin fixed-width />
                    </span>
                    <status-indicator v-else :status="stats.status" />
                </div>

                <div class="text-left flex-grow">
                    <skeleton :content="8">
                        <router-link :to="{name: 'server.system.index', params: { server: server?.uuidShort }}">
                            <p class="text-white text-lg">
                                {{ server?.name }}
                            </p>
                        </router-link>
                    </skeleton>
                    <p class="text-white/75">
                        <skeleton :content="16">
                            <span v-clipboard>{{ server.primaryAllocation().displayName() }}</span>

                            <span class="text-white/50">
                                <t :path="['generic.server.on_node', { node: server.node.name }]" />
                            </span>
                        </skeleton>
                    </p>
                </div>

                <button
                    v-tippy="'generic.server.go_to_console'"
                    class="border border-primary-50 px-2 rounded text-primary-0 hover:text-white mr-4"
                    @click="server?.openConsolePopup()"
                >
                    <fa :icon="['fas', 'external-link-square-alt']" fixed-width />
                </button>
                <skeleton :content="8">
                    <router-link :to="{name: 'server.system.index', params: { server: server?.uuidShort }}">
                        <button
                            v-tippy="'generic.server.manage'"
                            class="border border-primary-50 px-2 rounded text-primary-0 hover:text-white"
                        >
                            <fa :icon="['fas', 'wrench']" fixed-width />
                        </button>
                    </router-link>
                </skeleton>
            </div>

            <div class="flex flex-wrap justify-between align-start px-8 py-4">
                <p v-tippy="'generic.server.cpu'" class="text-white">
                    <skeleton :content="8">
                        <fa class="text-white/50 mr-1" :icon="['fas', 'tachometer-alt']" size="sm" fixed-width />
                        {{ stats.proc?.cpu?.total?.toFixed(2) ?? '--' }} %
                    </skeleton>
                </p>
                <p v-tippy="'generic.server.memory'" class="text-white">
                    <skeleton :content="8">
                        <fa class="text-white/50 mr-1" :icon="['fas', 'memory']" size="sm" fixed-width />

                        {{ memoryUsage }} / {{ memoryMax }}
                    </skeleton>
                </p>
                <p v-tippy="'generic.server.disk'" class="text-white">
                    <skeleton :content="8">
                        <fa class="text-white/50 mr-1" :icon="['fas', 'hdd']" size="sm" fixed-width />

                        {{ diskUsage }} / {{ diskMax }}
                    </skeleton>
                </p>
                <p v-tippy="'generic.server.players'" class="text-white">
                    <skeleton :content="8">
                        <fa class="text-white/50 mr-1" :icon="['fas', 'user']" size="sm" fixed-width />
                        {{ stats.query?.players?.length ?? '--' }} / {{ stats.query?.maxplayers ?? '--' }}
                    </skeleton>
                </p>
            </div>
        </div>
    </div>
</template>

<!--suppress CssUnresolvedCustomProperty -->
<style scoped>
    .server {
        border-radius: 8px;
        position: relative;
    }

    .server > * {
      position: relative;
      z-index: 2;
    }

    .server::before {
      content: "";
      position: absolute;
      display: block;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--thumbnail) no-repeat 50%;
      background-size: cover;
      opacity: .2;
      z-index: -1;
    }

    .gradient, .gradient::before, .gradient::after {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .gradient::before, .gradient::after {
        content: '';
        display: block;
    }

    .gradient {
        z-index: 1;
    }

    .gradient::before {
        background: rgb(37,36,68);
        background: linear-gradient(90deg, rgba(37,36,68,0.25) 0%, rgba(37,36,68,1) 100%);
    }

    .gradient::after {
        background: rgb(37,36,68);
        background: linear-gradient(0deg, rgba(37,36,68,0.25) 0%, rgba(37,36,68,1) 100%);
    }
</style>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, onUpdated, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Server } from '~/api/models';
import { mappedState, ServerStats } from '~/api/services/client/node';
import { ServersService } from '~/api/services/client';
import minecraft from '~/assets/svg/minecraft.png';
import StatusIndicator from '~/views/StatusIndicator.vue';
import { bytesToString } from '~/helpers';

export default defineComponent({
    components: { StatusIndicator },
    props: {
        server: {
            type: Server,
        },
    },

    setup(props) {
        const { t } = useI18n();

        const stats = ref<ServerStats>({
            status: -2,
        });

        let registered = false;
        const register = () => {
            if (registered || !props.server) return;

            ServersService.registerStats(
                props.server.uuidShort,
                props.server.node.id,
                serverStats => stats.value = serverStats,
            );
            registered = true;
        };

        const unregister = () => {
            if (!registered || !props.server) return;

            ServersService.unregisterStats(props.server.uuidShort);
            registered = false;
        };

        onMounted(register);
        onUpdated(register);
        onUnmounted(unregister);

        return {
            minecraft,
            stats,
            mappedState,

            memoryMax: computed(() => {
                const memory = props.server?.limits.memory;
                if (memory) {
                    const [value, unit] = bytesToString(memory * 1024 * 1024);
                    return `${value} ${t(`generic.units.${unit}`)}`;
                }

                return '--';
            }),
            memoryUsage: computed(() => {
                const memory = stats.value.proc?.memory?.total;
                if (memory) {
                    const [value, unit] = bytesToString(memory);
                    return `${value} ${t(`generic.units.${unit}`)}`;
                }

                return '--';
            }),

            diskMax: computed(() => {
                const disk = props.server?.limits.disk;
                if (disk) {
                    const [value, unit] = bytesToString(disk * 1024 * 1024);
                    return `${value} ${t(`generic.units.${unit}`)}`;
                }

                return '--';
            }),
            diskUsage: computed(() => {
                const disk = stats.value.proc?.disk?.used;
                if (disk) {
                    const [value, unit] = bytesToString(disk);
                    return `${value} ${t(`generic.units.${unit}`)}`;
                }

                return '--';
            }),
        };
    },
});
</script>