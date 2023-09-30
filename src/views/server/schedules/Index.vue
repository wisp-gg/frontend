<template>
    <container no-padding title="server.schedules.name">
        <template #actions>
            <manage-schedule-modal />
        </template>

        <list service-id="schedules@getAll" :fields="listFields">
            <template #headers-before>
                <th />
            </template>

            <template #no-items-extra>
                <div class="pt-2">
                    <manage-schedule-modal />
                </div>
            </template>


            <template #headers-after>
                <th />
            </template>

            <template #fields-before="{ result }">
                <td class="text-center">
                    <skeleton :content="4">
                        <state-label :schedule="result" />
                    </skeleton>
                </td>
            </template>

            <template #field-name="{ result }">
                <v-button class="text-white/75" :to="{ name: 'server.configuration.schedules.manage', params: { schedule: result.id } }" permission="schedule.read">
                    {{ result.name }}
                </v-button>
            </template>

            <template #field-tasks="{ result }">
                <code>{{ result.tasks.length }}</code>
            </template>

            <template #fields-after="{ result }">
                <td class="p-6 text-right">
                    <div class="space-x-4">
                        <skeleton :content="8">
                            <v-button color="primary" permission="schedule.read" :to="{ name: 'server.configuration.schedules.manage', params: { schedule: result.id } }">
                                <t path="generic.manage" />
                            </v-button>
                        </skeleton>

                        <skeleton :content="4">
                            <delete-schedule-modal :schedule="result" />
                        </skeleton>
                    </div>
                </td>
            </template>
        </list>
    </container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ManageScheduleModal from './ManageScheduleModal.vue';
import DeleteScheduleModal from './DeleteScheduleModal.vue';
import StateLabel from './StateLabel.vue';

export default defineComponent({
    components: { StateLabel, ManageScheduleModal, DeleteScheduleModal },
    setup() {
        return {
            listFields: <ListField[]>[
                { key: 'name', skeleton: 8 },
                { key: 'tasks', skeleton: 4 },
                { key: 'lastRunAt', label: 'last_run', format: 'datetime', skeleton: 16 },
                { key: 'nextRunAt', label: 'next_run', format: 'datetime', skeleton: 16 },
            ]
        };
    },
});
</script>
