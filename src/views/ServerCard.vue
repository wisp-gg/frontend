<template>
    <div class="w-full 2xl:even:pl-3 2xl:odd:pr-3">
        <div class="server flex flex-col text-center overflow-hidden whitespace-nowrap" :style="`--thumbnail:url('${server?.egg?.thumbnail || minecraft}');`">
            <div class="gradient" />
            <div class="flex items-center bg-primary-900 bg-opacity-25 px-4 md:px-8 py-4">
                <div class="self-start mt-1 mr-2">
                    <span v-if="!server || stats.status === -2" class="text-accent-500">
                        <fa :icon="['fas', 'spinner']" spin fixed-width />
                    </span>
                    <status-indicator v-else :status="stats.status" />
                </div>

                <div class="text-left flex-grow overflow-hidden">
                    <p class="text-white text-lg">
                        <skeleton :content="8">
                            <router-link :to="{name: 'server.system.index', params: { server: server?.uuidShort }}">
                                {{ server?.name }}
                            </router-link>
                            <span class="text-white/50 hidden md:inline text-sm leading-none tracking-tight pl-2" v-clipboard>
                                {{ server?.uuidShort }}
                            </span>
                        </skeleton>
                    </p>
                    <p class="text-white/75">
                        <skeleton :content="16">
                            <span class="tracking-wide" v-clipboard>{{ server.primaryAllocation().displayName() }}</span>

                            <span class="text-white/50 block md:inline text-sm leading-none tracking-tight">
                                <t :path="['generic.server.on_node', { node: server.node.name }]" />
                            </span>
                        </skeleton>
                    </p>
                </div>

                <button
                    v-tippy="'generic.server.go_to_console'"
                    class="border border-primary-50 px-2 rounded text-primary-0 hover:text-white mr-4 hidden md:block"
                    @click="server?.openConsolePopup()"
                >
                    <fa :icon="['fas', 'external-link-square-alt']" fixed-width />
                </button>
                <skeleton :content="8">
                    <router-link :to="{name: 'server.system.index', params: { server: server?.uuidShort }}">
                        <button
                            v-tippy="'generic.server.manage'"
                            class="border border-primary-50 px-2 rounded text-primary-0 hover:text-white hidden md:block"
                        >
                            <fa :icon="['fas', 'wrench']" fixed-width />
                        </button>
                    </router-link>
                </skeleton>
            </div>

            <div class="grid grid-cols-2 xl:grid-cols-4 px-4 py-2 md:px-8 md:py-4">
                <p v-tippy="'generic.server.cpu'" class="block md:flex 2xl:block flex-col items-center text-white text-sm xl:text-normal tracking-tight">
                    <skeleton :content="8">
                        <fa class="text-white/50 mr-1 inline md:block 2xl:inline" :icon="['fas', 'tachometer-alt']" size="sm" fixed-width />
                        {{ stats.proc?.cpu?.total?.toFixed(2) ?? '--' }} %
                    </skeleton>
                </p>
                <p v-tippy="'generic.server.memory'" class="block md:flex 2xl:block flex-col items-center text-white text-sm xl:text-normal tracking-tight">
                    <skeleton :content="8">
                        <fa class="text-white/50 mr-1 inline md:block 2xl:inline" :icon="['fas', 'memory']" size="sm" fixed-width />

                        {{ memoryUsage }} / {{ memoryMax }}
                    </skeleton>
                </p>
                <p v-tippy="'generic.server.disk'" class="block md:flex 2xl:block flex-col items-center text-white text-sm xl:text-normal tracking-tight">
                    <skeleton :content="8">
                        <fa class="text-white/50 mr-1 inline md:block 2xl:inline" :icon="['fas', 'hdd']" size="sm" fixed-width />

                        {{ diskUsage }} / {{ diskMax }}
                    </skeleton>
                </p>
                <p v-tippy="'generic.server.players'" class="block md:flex 2xl:block flex-col items-center text-white text-sm xl:text-normal tracking-tight">
                    <skeleton :content="8">
                        <fa class="text-white/50 mr-1 inline md:block 2xl:inline" :icon="['fas', 'user']" size="sm" fixed-width />
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
import { defineComponent, ref, onMounted, onUnmounted, computed, watch } from 'vue';
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
        const register = (server?: Server) => {
            if (registered || !server) return;

            ServersService.registerStats(
                server.uuidShort,
                server.node.id,
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
