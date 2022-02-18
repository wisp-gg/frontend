<template>
    <server-list-page :filter-node="nodeId" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';
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
