<template>
    <modal has-alerts title="server.schedules.delete_task">
        <template #opener="{ open }">
            <v-button @click="open" v-tippy="'generic.delete'" permission="schedule.update" color="danger" class="py-3 px-6">
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t path="server.schedules.delete_task_notice" />

            <div class="text-right">
                <v-button color="danger" @click="confirm" spinner>
                    <t path="generic.delete" />
                </v-button>
            </div>
        </template>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ScheduleTask } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        task: {
            type: ScheduleTask,
            required: true,
        },
    },
    setup(props) {
        return {
            confirm: () => useService('scheduleTasks@delete', 'server.schedules.delete_task', {
                id: props.task.id
            }),
        };
    }
});
</script>
