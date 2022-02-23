<template>
    <server-list-page :filter="{ ['domains.id']: domainId }" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';
import ServerListPage from '~/views/admin/servers/Index.vue';

export default defineComponent({
    components: { ServerListPage },
    setup() {
        return {
            domainId: computed(() => state.navigation.currentRoute.params!.domain),
        };
    }
});
</script>
