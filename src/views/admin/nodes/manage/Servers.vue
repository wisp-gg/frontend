<template>
    <server-list-page :filter="{ node_id: nodeId }" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import state from '~/state';
import ServerListPage from '~/views/admin/servers/Index.vue';

export default defineComponent({
    components: { ServerListPage },
    setup() {
        return {
            nodeId: computed(() => state.navigation.currentRoute.params!.node),
        };
    }
});
</script>
