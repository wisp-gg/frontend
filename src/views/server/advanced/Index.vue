<template>
    <div class="grid xl:grid-cols-3 items-start gap-x-4 gap-y-4">
        <container title="server.advanced.toggle_support_access">
            <p class="flex-grow">
                <t path="server.advanced.support.description" />
            </p>

            <skeleton :content="16">
                <v-button class="mt-3 w-full" :color="server.supportOp ? 'danger' : 'primary'" @click="toggleSupport" spinner>
                    <t :path="`generic.${server.supportOp ? 'disable' : 'enable'}`" />
                </v-button>
            </skeleton>
        </container>

        <can feature="updater" v-if="canUpdate">
            <update-container />
        </can>

        <monitor-container />

        <can feature="version-manager">
            <template #no-feature>
                <reinstall-container />
            </template>

            <install-different-edition-container />
        </can>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { dispatch, state } from '~/core';
import UpdateContainer from './UpdateContainer.vue';
import MonitorContainer from './MonitorContainer.vue';
import ReinstallContainer from './ReinstallContainer.vue';
import InstallDifferentEditionContainer from './InstallDifferentEditionContainer.vue';
import { useService } from '~/plugins';
import { Server } from '~/api/models';

export default defineComponent({
    components: { UpdateContainer, MonitorContainer, ReinstallContainer, InstallDifferentEditionContainer },
    setup() {
        return {
            server: computed(() => state.models.server!),

            canUpdate: computed<boolean>(() => state.models.server?.egg?.canUpdate || false),

            toggleSupport: () => useService<Server>('advanced@toggleSupport', true).then((server: Server) => {
                dispatch('alerts/add', {
                    type: 'success',
                    title: [`server.advanced.support.${server.supportOp ? 'enable_access_alert' : 'disable_access_alert'}`],
                });
            }),
        };
    },
});
</script>
