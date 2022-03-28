<template>
    <modal
        has-alerts="server.schedules.manage"
        :title="`server.schedules.${task ? 'edit_task' : 'create_task'}`"
        :opener-text="`${task ? 'generic.edit' : 'server.schedules.create_task'}`"
        :opener-color="task ? 'warning' : 'primary'"
    >
        <v-form :service-id="submit">
            <div class="flex flex-col lg:flex-row">
                <v-select
                    class="lg:w-1/2 lg:mr-4"

                    name="action"
                    prefix="server.schedules.actions"
                    :options="allowedActions"
                    v-model:value="action"
                    rule="required"
                />

                <v-input
                    class="lg:w-1/2"

                    name="time_offset"
                    type="number"
                    rule="required"
                    :value="task?.timeOffset ?? 0"
                />
            </div>

            <v-select
                v-if="action === 'power'"

                name="payload"
                prefix="server.schedules.power_actions"
                :options="allowedPowerActions"
                :value="task?.payload ?? 'start'"
                rule="required"
            />

            <v-input
                v-if="action === 'command'"

                name="payload"
                :value="task?.payload"
                rule="required"
            />

            <div class="text-right space-x-4">
                <v-submit no-margin color="primary" label="generic.submit" />
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ScheduleTask } from '~/api/models';
import { onModelLoaded, useService } from '~/plugins';

export default defineComponent({
    props: {
        task: {
            type: ScheduleTask
        }
    },
    setup(props) {
        const allowedActions = ref<string[]>(['power', 'command']);
        const allowedPowerActions = ['start', 'restart', 'stop', 'kill'];
        const action = ref<string>(props.task?.action || allowedActions.value[0]);

        onModelLoaded('server', server => {
            if (server.featureLimits.backupMegabytes > 0) {
                allowedActions.value.push('backup');
            }
        });

        return {
            allowedActions,
            allowedPowerActions,
            action,

            submit: (data: any) => {
                return useService(`scheduleTasks@${props.task ? 'update' : 'create'}`, 'server.schedules.manage_task', {
                    ...(props.task ? { id: props.task.id } : {}),
                    ...data
                });
            }
        };
    }
});
</script>
