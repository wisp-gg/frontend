<template>
    <container title="server.advanced.reinstall_server">
        <template #container-header-extra>
            <div class="inline pl-2">
              <fa class="text-white/50 inline" v-tippy="'server.advanced.reinstall.description'" :icon="['fas', 'circle-info']" size="sm" fixed-width />
            </div>
        </template>

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
