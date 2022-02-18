<template>
    <server-list-page :filter-user="userId" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';
import ServerListPage from '~/views/admin/servers/Index.vue';

export default defineComponent({
    components: { ServerListPage },
    setup() {
        return {
            userId: computed(() => state.navigation.currentRoute.params!.user),
        };
    }
});
</script>
