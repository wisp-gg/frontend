<template>
    <div>
        <accept-eula-modal />
        <console />
        <div class="text-center pb-4">
            <power-actions />
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
import { defineComponent } from 'vue';
import PowerActions from '~/views/server/PowerActions.vue';
import Console from '~/views/server/Console.vue';
import AcceptEulaModal from '~/views/server/AcceptEulaModal.vue';

export default defineComponent({
    components: { AcceptEulaModal, PowerActions, Console },
    setup() {
        return {};
    },
});
</script>
