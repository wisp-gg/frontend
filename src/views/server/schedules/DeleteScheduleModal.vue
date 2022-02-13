<template>
    <modal has-alerts title="server.schedules.delete_schedule">
        <template #opener="{ open }">
            <v-button @click="open" v-tippy="'generic.delete'" color="danger" permission="schedule.delete" class="py-3 px-6">
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t :path="['server.schedules.delete_notice', { name: schedule.name }]" />

            <v-form class="mt-4" :service-id="confirm" :can-submit="canDelete">
                <v-input name="confirm_name" v-model:value="confirmNameValue" />

                <div class="text-right">
                    <v-submit color="danger">
                        <t path="generic.delete" />
                    </v-submit>
                </div>
            </v-form>
        </template>
    </modal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { dispatch, state } from '~/core';
import { Schedule } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        schedule: {
            type: Schedule,
            required: true,
        },
        redirect: {
            type: Boolean
        }
    },
    setup(props) {
        const router = useRouter();

        const confirmNameValue = ref<string>('');

        return {
            confirmNameValue,

            canDelete: computed(() => confirmNameValue.value === props.schedule.name),

            confirm: () => {
                return useService('schedules@delete', 'server.schedules.delete_schedule', {
                    id: props.schedule.id
                }).then(() => {
                    if (props.redirect) {
                        router.push({
                            name: 'server.configuration.schedules.index',
                            params: {
                                server: state.models.server!.uuidShort,
                            }
                        });
                    } else {
                        dispatch('lists/refresh', 'schedules@getAll');
                    }
                });
            }
        };
    }
});
</script>
