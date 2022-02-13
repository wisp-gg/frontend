<template>
    <div class="bg-opacity-20 rounded-full p-1.5" :class="[`bg-${color}`]" v-tippy="`generic.server.status.${state}`">
        <div class="bg-opacity-100 rounded-full w-2 h-2" :class="[`bg-${color}`]" />
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { mappedState } from '~/api/services/client/node';

export default defineComponent({
    props: {
        status: {
            type: Number
        },
    },
    setup(props) {
        return {
            color: computed(() => props.status !== undefined && mappedState[props.status] ? mappedState[props.status][0] : 'danger'),
            state: computed(() => props.status !== undefined && mappedState[props.status] ? mappedState[props.status][1] : 'error'),
        };
    },
});
</script>
