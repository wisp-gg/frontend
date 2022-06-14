<template>
    <container title="server.advanced.reinstall_server">
        <p class="flex-grow">
            <t path="server.advanced.reinstall.description" />
        </p>

        <!-- TODO: confirmation-modal component -->
        <v-button color="danger" permission="reinstall.update" class="mt-3 w-full" @click="reinstall" spinner>
            <t path="server.advanced.reinstall_server" />
        </v-button>
    </container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useService } from '~/plugins';

export default defineComponent({
    setup() {
        return {
            reinstall: () => useService('advanced@reinstall', true),
        };
    },
});
</script>
