<template>
    <div>
        <container class="mb-4">
            <template #header>
                <div class="flex justify-between">
                    <div class="flex items-center">
                        <skeleton :content="4">
                            <state-label :schedule="schedule" />
                        </skeleton>

                        <skeleton :content="12">
                            <h2 class="text-lg text-white/75">
                                {{ schedule.name }}
                            </h2>
                            <p class="text-white/50 ml-2">
                                <t :path="['server.schedules.runs_description', { description: cronDescription }]" />
                            </p>
                        </skeleton>
                    </div>

                    <div class="space-x-4">
                        <skeleton :content="4">
                            <manage-schedule-modal :schedule="schedule" />
                        </skeleton>

                        <skeleton :content="6">
                            <manage-task-modal />
                        </skeleton>
                    </div>
                </div>
            </template>

            <!-- TODO: Make box into component tbh -->
            <div class="pb-2 border-b border-primary-400">
                <div class="flex justify-between rounded overflow-hidden">
                    <div class="cron_time w-1/4 bg-primary-600 px-6 py-4">
                        <h2 class="text-lg text-white/75 font-light">
                            <t path="components.form.fields.cron_minute" />
                        </h2>

                        <skeleton :content="8">
                            <p class="text-lg">
                                {{ schedule.cron.minute }}
                            </p>
                        </skeleton>
                    </div>

                    <div class="cron_time w-1/4 bg-primary-600 px-6 py-4">
                        <h2 class="text-lg text-white/75 font-light">
                            <t path="components.form.fields.cron_hour" />
                        </h2>
                        <skeleton :content="8">
                            <p class="text-lg">
                                {{ schedule.cron.hour }}
                            </p>
                        </skeleton>
                    </div>

                    <div class="cron_time w-1/4 bg-primary-600 px-6 py-4">
                        <h2 class="text-lg text-white/75 font-light">
                            <t path="components.form.fields.cron_day_of_month" />
                        </h2>
                        <skeleton :content="8">
                            <p class="text-lg">
                                {{ schedule.cron.dayOfMonth }}
                            </p>
                        </skeleton>
                    </div>

                    <div class="cron_time w-1/4 bg-primary-600 px-6 py-4">
                        <h2 class="text-lg text-white/75 font-light">
                            <t path="components.form.fields.cron_day_of_week" />
                        </h2>
                        <skeleton :content="8">
                            <p class="text-lg">
                                {{ schedule.cron.dayOfWeek }}
                            </p>
                        </skeleton>
                    </div>
                </div>

                <div class="flex justify-between px-4 mt-2">
                    <p class="text-white/50">
                        <t path="server.schedules.last_run_at" /><span class="text-white/75">{{ lastRunAt }}</span>
                    </p>
                    <p class="text-white/50">
                        <t path="server.schedules.next_run_at" /><span class="text-white/75">{{ nextRunAt }}</span>
                    </p>
                </div>
            </div>

            <div class="space-y-4 mt-4">
                <template v-for="task in tasks" :key="task.sequenceId">
                    <div v-if="task.timeOffset > 0" class="flex items-center pl-4">
                        <fa :icon="['fas', 'stopwatch']" class="text-2xl text-white/75 mr-3" />

                        <p>
                            <t :path="['server.schedules.pause_for_seconds', { seconds: task.timeOffset }]" />
                        </p>
                    </div>

                    <div class="flex bg-primary-600 px-6 py-4 rounded-lg items-center justify-between">
                        <div class="flex items-center flex-grow">
                            <p class="text-2xl text-white font-bold">
                                {{ task.sequenceId }}
                            </p>

                            <div class="ml-4">
                                <h3 class="uppercase">
                                    <t :path="`server.schedules.actions.${task.action}`" />
                                </h3>
                                <code v-if="task.payload" class="mt-2 break-all">
                                    {{ task.payload }}
                                </code>
                            </div>
                        </div>

                        <div class="gap-x-4">
                            <skeleton :content="8">
                                <manage-task-modal :task="task" />
                            </skeleton>

                            <skeleton :content="8">
                                <delete-task-modal :task="task" />
                            </skeleton>
                        </div>
                    </div>
                </template>
            </div>
        </container>

        <div class="text-right space-x-4">
            <skeleton :content="8">
                <v-button v-if="schedule.isActive" color="primary" permission="schedule.update" @click="trigger">
                    <t path="generic.trigger" />
                </v-button>
            </skeleton>


            <skeleton :content="4">
                <delete-schedule-modal redirect :schedule="schedule" />
            </skeleton>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.cron_time {
    @apply border-r border-primary-400;

    &:last-child {
        @apply border-none;
    }
}
</style>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import cronstrue from 'cronstrue/i18n';
import { formatDateAbsolute } from '~/core';
import state from '~/state';
import { useService } from '~/plugins';
import ManageScheduleModal from './ManageScheduleModal.vue';
import DeleteScheduleModal from './DeleteScheduleModal.vue';
import ManageTaskModal from './ManageTaskModal.vue';
import DeleteTaskModal from './DeleteTaskModal.vue';
import StateLabel from './StateLabel.vue';
import { ScheduleTask } from '~/api/models';
import cronParser from 'cron-parser';

export default defineComponent({
    components: { ManageScheduleModal, DeleteScheduleModal, ManageTaskModal, DeleteTaskModal, StateLabel },
    setup() {
        const { t } = useI18n();

        const schedule = computed(() => state.models.schedule!);
        const cronString = computed(() => schedule.value?.cron ? `${schedule.value.cron.minute} ${schedule.value.cron.hour} ${schedule.value.cron.dayOfMonth} * ${schedule.value.cron.dayOfWeek}` : null);

        return {
            schedule,

            // TODO: locale support
            cronDescription: computed(() => {
                if (!cronString.value) return;

                const description = cronstrue.toString(cronString.value, { locale: 'en', use24HourTimeFormat: true });

                return description.charAt(0).toLowerCase() + description.slice(1);
            }),

            lastRunAt: computed(() => schedule.value?.lastRunAt ? formatDateAbsolute(schedule.value.lastRunAt, 'LL @ LT') : t('generic.not_applicable')),
            nextRunAt: computed(() => cronString.value ? formatDateAbsolute(cronParser.parseExpression(cronString.value, {
                tz: 'Europe/London',
            }).next().toISOString(), 'LL @ LT') : t('generic.not_applicable')),
            tasks: computed(() => (schedule.value?.tasks || []).sort((a: ScheduleTask, b: ScheduleTask) => a.sequenceId - b.sequenceId) || []),

            trigger: () => {
                return useService('schedules@trigger', true).then(() => schedule.value!.isProcessing = true);
            },
        };
    },
});
</script>
