<template>
    <modal
        has-alerts="server.schedules.manage"
        :title="`server.schedules.${schedule ? 'edit_schedule' : 'create_new'}`"
        :opener-text="`generic.${schedule ? 'edit' : 'create'}`"
        :opener-color="schedule ? 'warning' : 'primary'"
        :permission="schedule ? 'schedule.update' : 'schedule.create'"
    >
        <v-form :service-id="`schedules@${schedule ? 'update' : 'create'}`" :on-success="onSuccess">
            <v-input name="name" rule="required" :value="schedule?.name" />

            <div class="w-full bg-primary-300 p-2 mb-4 text-center rounded-lg">
                <h2 class="text-2xl uppercase">
                    {{ cronDescription }}
                </h2>
                <p>
                    <t :path="['server.schedules.next_run_at_time', { time: nextRunTime }]" />
                </p>
            </div>

            <div class="flex space-x-4">
                <v-input name="cron_minute" rule="required" v-model:value="cron.minute" />
                <v-input name="cron_hour" rule="required" v-model:value="cron.hour" />
                <v-input name="cron_day_of_month" rule="required" v-model:value="cron.dayOfMonth" />
                <v-input name="cron_day_of_week" rule="required" v-model:value="cron.dayOfWeek" />
            </div>

            <v-switch name="is_active" label="components.form.fields.enabled" footer="server.schedules.enabled_footer" :value="schedule?.isActive ?? true" />

            <div class="text-right space-x-4">
                <v-submit no-margin color="primary" label="generic.submit" :permission="schedule ? 'schedule.update' : 'schedule.create'" />
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import cronstrue from 'cronstrue/i18n';
import cronParser from 'cron-parser';
import { Schedule } from '~/api/models';
import { dispatch, formatDateAbsolute, state } from '~/core';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    props: {
        schedule: {
            type: Schedule
        }
    },
    setup(props) {
        const { t } = useI18n();
        const { push } = useRouter();

        const cron = reactive({
            ...(props.schedule ? {
                ...props.schedule.cron
            } : {
                minute: '*/30',
                hour: '*',
                dayOfMonth: '*',
                dayOfWeek: '*',
            })
        });

        const cronString = computed(() => `${cron.minute} ${cron.hour} ${cron.dayOfMonth} * ${cron.dayOfWeek}`);

        return {
            cron,

            // TODO: locale support
            cronDescription: computed(() => cronstrue.toString(cronString.value, { locale: 'en', use24HourTimeFormat: true })),
            nextRunTime: computed(() => formatDateAbsolute(cronParser.parseExpression(cronString.value).next().toISOString(), 'LL @ LT') || t('generic.not_applicable')),

            onSuccess: (schedule: Schedule) => {
                if (props.schedule) {
                    return dispatch('models/refresh', 'schedule');
                } else push({
                    name: 'server.configuration.schedules.manage',
                    params: {
                        server: state.models.server!.uuidShort,
                        schedule: schedule.id
                    }
                });
            }
        };
    }
});
</script>
