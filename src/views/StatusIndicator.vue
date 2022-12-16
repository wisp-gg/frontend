<template>
    <div class="bg-opacity-20 rounded-full p-1.5" :class="[`bg-${color}`]" v-tippy="`generic.server.status.${status}`">
        <div class="bg-opacity-100 rounded-full w-2 h-2" :class="[`bg-${color}`]" />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { mappedState, ServerStatus } from '~/api/services/client/servers';
import { state } from '~/core';

export default defineComponent({
    props: {
        status: {
            type: String,
            default: ServerStatus.Error
        },
    },
    setup(props) {
        const server = computed(() => state.models.server);

        return {
            color: computed(() => {
                if (props.status != undefined && mappedState[props.status]) return mappedState[props.status];
                if (server.value?.suspended) return mappedState[ServerStatus.Suspended];

                return mappedState[ServerStatus.Error];
            }),
        };
    },
});
</script>
