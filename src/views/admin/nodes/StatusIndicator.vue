<template>
    <fa v-if="loadingFirst" :icon="['fas', 'spinner']" class="text-2xl text-white/75" spin />
    <fa v-else-if="runningVersion" v-tippy="[runningVersion, undefined, true]" :icon="['fas', 'heartbeat']" class="text-2xl text-accent-200" />
    <fa v-else v-tippy="`admin.nodes.not_alive`" :icon="['far', 'heart']" class="text-2xl text-danger" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { NodeDaemonInfo } from '~/api/services/admin/nodes';

export default defineComponent({
    props: {
        loadingFirst: {
            type: Boolean,
        },
        daemonInfo: {
            type: Object as () => NodeDaemonInfo,
        },
    },

    setup(props) {
        return {
            runningVersion: computed(() => props.daemonInfo?.alive ? props.daemonInfo.version : null),
        };
    }
});
</script>
