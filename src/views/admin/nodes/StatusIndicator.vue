<template>
    <fa v-if="loadingFirst" :icon="['fas', 'spinner']" class="text-2xl text-white/75" spin />
    <fa v-else-if="runningVersion" v-tippy="runningVersion" :icon="['fas', 'heartbeat']" class="text-2xl text-accent-200" />
    <fa v-else v-tippy="`admin.nodes.not_alive`" :icon="['far', 'heart']" class="text-2xl text-danger" />
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { Node } from '~/api/models';
import { NodeDaemonInfo } from '~/api/services/admin/nodes';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        node: {
            type: Node,
            required: true
        }
    },

    setup(props) {
        const loadingFirst = ref<boolean>(true);
        const runningVersion = ref<string | null>(null);

        let timer: NodeJS.Timer | null = null;

        const ping = async () => {
            const nodeInfo = await useService<NodeDaemonInfo>('nodes@daemonInfo', { displayErrorsInUI: true, background: true }, {
                id: props.node.id
            });

            runningVersion.value = nodeInfo.alive ? nodeInfo.version : null;
            if (loadingFirst.value) loadingFirst.value = false;
        };

        onMounted(() => {
            ping();
            timer = setInterval(ping, 10 * 1000);
        });
        onUnmounted(() => timer && clearInterval(timer));

        return {
            loadingFirst,
            runningVersion
        };
    }
});
</script>
