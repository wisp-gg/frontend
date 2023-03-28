<template>
    <container title="server.advanced.health_monitor">
              <template #container-header-extra>
            <div class="inline pl-2">
              <fa class="text-white/50 inline" v-tippy="'server.advanced.monitor.description'" :icon="['fas', 'circle-info']" size="sm" fixed-width />
            </div>
        </template>

        <skeleton :content="16">
            <v-button :color="server.monitor ? 'danger' : 'success'" permission="monitor.update" class="w-full" @click="toggleMonitor" spinner>
                <t :path="`generic.${server.monitor ? 'disable' : 'enable'}`" />
            </v-button>
        </skeleton>
    </container>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state, dispatch } from '~/core';
import { useService } from '~/plugins';

export default defineComponent({
    setup() {
        return {
            server: computed(() => state.models.server!),

            toggleMonitor: () => useService('advanced@toggleMonitor', true)
                .then(() => {
                    dispatch('alerts/add', {
                        timeout: 5000,

                        type: 'success',
                        title: ['server.advanced.monitor.toggled'],
                    });
                }),
        };
    },
});
</script>
