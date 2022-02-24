<template>
    <div>
        <accept-eula-modal />
        <console />
        <div class="pb-4 flex justify-center items-center">
            <power-actions />

            <div class="pt-4 ml-4" v-if="server?.joinURL">
                <v-button color="primary" :href="server?.joinURL">
                    Join Server
                </v-button>
            </div>
        </div>

        <container title="generic.server.resource_usage">
            <div class="grid grid-cols-2">
                <chart type="cpu" />
                <chart type="memory" />
            </div>
        </container>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { state } from '~/core';
import PowerActions from '~/views/server/PowerActions.vue';
import Console from '~/views/server/Console.vue';
import AcceptEulaModal from '~/views/server/AcceptEulaModal.vue';

export default defineComponent({
    components: { AcceptEulaModal, PowerActions, Console },
    setup() {
        return {
            server: computed(() => state.models.server),
        };
    },
});
</script>
