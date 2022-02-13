<template>
    <span
        class="label mr-2"
        :class="schedule.isProcessing ? 'label-warning' : schedule.isActive && 'label-success' || 'label-danger'"
    >
        <t :path="`server.schedules.states.${schedule.isProcessing ? 'processing' : schedule.isActive && 'active' || 'disabled'}`" />
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Schedule } from '~/api/models';

export default defineComponent({
    props: {
        schedule: {
            type: Schedule,
            required: true,
        }
    },

    setup() {

    }
});
</script>
