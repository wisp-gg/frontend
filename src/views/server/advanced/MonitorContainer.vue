<template>
    <container title="server.advanced.health_monitor">
        <p class="flex-grow">
            <t path="server.advanced.monitor.description" />
        </p>

        <skeleton :content="16">
            <v-button :color="server.monitor ? 'danger' : 'success'" permission="monitor.update" class="mt-3 w-full" @click="toggleMonitor" spinner>
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
