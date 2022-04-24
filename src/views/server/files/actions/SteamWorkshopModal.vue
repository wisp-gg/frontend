<template>
    <modal title="server.files.steam_workshop" @update:modelValue="onModalChange">
        <template #opener="{ open }">
            <v-button @click="open" color="secondary" permission="file.steam_workshop" class="flex items-center p-4 text-sm w-full rounded-b-none">
                <fa class="mr-2" :icon="['fab', 'steam']" size="lg" fixed-width />
                <t path="server.files.steam_workshop" />
            </v-button>
        </template>

        <template #default>
            <stepper :steps="4" ref="stepper">
                <template #step-1>
                    <fa :icon="['fas', 'spinner']" spin size="lg" fixed-width />
                </template>

                <template #step-2>
                    <v-form :service-id="workshop" class="flex-grow">
                        <v-input name="workshop_url" rule="required" />

                        <div class="text-right">
                            <v-submit color="primary" label="generic.submit" permission="file.steam_workshop" />
                        </div>
                    </v-form>
                </template>

                <template #step-3>
                    <div class="flex items-center p-3 mb-2 bg-primary-400 rounded" v-for="item of status.slice(0, 10)" :key="item.name">
                        <p class="flex-grow text-white text-opacity-75">
                            {{ item.name }}
                        </p>
                        <span :class="['label', `label-${LabelLookup[item.status[0]]}`]">
                            <t :path="[`server.files.steam_workshop_state.${NameLookup[item.status[0]]}`, item.status[1]]" />
                        </span>
                    </div>
                    <div class="flex items-center p-3 mb-2 bg-primary-400 rounded" v-if="status.length > 10">
                        <p class="text-white text-opacity-75">
                            <t :path="['server.files.steam_workshop_n_more', status.length - 10]" />
                        </p>
                    </div>
                </template>

                <template #step-4>
                    <template v-if="errors.length > 0">
                        <t path="server.files.steam_workshop_finished_but_with_errors" />
                        <ul>
                            <li v-for="(error, index) of errors" :key="index">
                                <t :path="error" />
                            </li>
                        </ul>
                    </template>
                    <t path="server.files.steam_workshop_finished" v-else />
                </template>
            </stepper>
        </template>
    </modal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import state from '~/state';
import { useDaemonEvent, triggerDaemonAction } from '~/plugins';
import { WorkshopDownloadState, WorkshopDownloadStatus } from '~/api/services/daemon/types';

const NameLookup = {
    [WorkshopDownloadState.WAITING]: 'waiting',
    [WorkshopDownloadState.DOWNLOADING]: 'downloading',
    [WorkshopDownloadState.EXTRACTING]: 'extracting',
    [WorkshopDownloadState.PARSING]: 'parsing',
    [WorkshopDownloadState.WRITING]: 'writing',
};

const LabelLookup = {
    [WorkshopDownloadState.WAITING]: 'secondary',
    [WorkshopDownloadState.DOWNLOADING]: 'success',
    [WorkshopDownloadState.EXTRACTING]: 'success',
    [WorkshopDownloadState.PARSING]: 'success',
    [WorkshopDownloadState.WRITING]: 'success',
};

export default defineComponent({
    props: {
        path: {
            type: String,
            required: true,
        },
    },

    setup(props, context) {
        const stepper = ref<any | undefined>();
        const status = ref<WorkshopDownloadStatus | undefined>([]);
        const errors = ref<[string, object?][]>([]);
        let finished = false;

        let workshopDlStatus: any, workshopDlNew: any, workshopDlFinish: any, resolve: any;
        return {
            stepper,
            status,
            errors,
            NameLookup,
            LabelLookup,

            onModalChange: (visible: boolean) => {
                if (visible) {
                    workshopDlStatus = useDaemonEvent('workshop-dl-status', s => {
                        if (resolve) {
                            resolve();
                            resolve = undefined;
                        }

                        status.value = s;

                        stepper.value?.setStep(3);
                    });
                    workshopDlNew = useDaemonEvent('workshop-dl-new', () => stepper.value?.setStep(2));
                    workshopDlFinish = useDaemonEvent('workshop-dl-finish', e => {
                        if (e && e[0]) {
                            if (!Array.isArray(e[0])) { // Some untranslated error message for some reason?
                                errors.value = [e as any];
                            } else {
                                errors.value = e.map(a => {
                                    return [`daemon.errors.steam_workshop.${a[0]}`, a[1]];
                                });
                            }
                        } else {
                            errors.value = [];
                        }

                        finished = true;
                        stepper.value?.setStep(4);
                    });

                    triggerDaemonAction('workshop-dl-get-status');
                } else {
                    workshopDlStatus?.();
                    workshopDlNew?.();
                    workshopDlFinish?.();

                    resolve?.();
                    resolve = undefined;

                    if (finished) {
                        state.lists.refresh('files@getDirectory');

                        finished = false;
                    }
                }
            },
            workshop: (data: { workshop_url: string }): Promise<void> => {
                return new Promise((r, reject) => {
                    resolve = r;

                    triggerDaemonAction('workshop-dl-download', {
                        dir: props.path,
                        id: data.workshop_url,
                    });
                });
            },
        };
    },
});
</script>
