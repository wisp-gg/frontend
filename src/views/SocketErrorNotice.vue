<template>
    <div v-if="server && socket.error" class="w-full py-2 px-4 bg-red-900 flex items-center justify-center text-white/75">
        <fa v-if="socket.error === 'errors.socket.trouble_connecting'" class="mr-2" :icon="['fas', 'spinner']" spin />
        <fa v-else class="mr-2" :icon="['fa', 'exclamation-triangle']" />
        <t :path="`daemon.${socket.error}`" />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import state from '~/state';

export default defineComponent({
    setup() {
        return {
            server: computed(() => state.models.server),
            socket: computed(() => state.server),
        };
    },
});
</script>
