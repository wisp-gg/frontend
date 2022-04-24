<template>
    <container title="server.fastdl.sync">
        <div class="mb-4">
            <!-- TODO: This changes slightly per egg, add support for that -->
            <alert type="info" icon="info-circle" :title="['server.fastdl.note']" />
        </div>

        <div class="flex flex-col lg:flex-row items-center">
            <div class="lg:mr-16">
                <img class="w-64" :src="syncAsset">
            </div>

            <div class="space-y-4">
                <div class="flex items-center">
                    <h2 class="text-4xl">
                        01
                    </h2>

                    <h2 class="text-white/75 text-lg mx-4">
                        <t path="server.fastdl.click_button" />
                    </h2>

                    <v-button color="primary" permission="fastdl.update" @click="sync">
                        <t path="server.fastdl.sync_button" />
                    </v-button>
                </div>

                <div class="flex items-center">
                    <h2 class="text-4xl">
                        02
                    </h2>

                    <i18n-t keypath="server.fastdl.enable_fastdl" class="text-white/75 ml-3" tag="p">
                        <template #code>
                            <code>
                                sv_downloadurl {{ fastDlUrl }}
                            </code>
                        </template>

                        <template #file>
                            <code>cfg/server.cfg</code>
                        </template>
                    </i18n-t>
                </div>
            </div>
        </div>
    </container>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import state from '~/state';
import { useService } from '~/plugins';
import syncAsset from '~/assets/svg/undraw/sync.svg';

export default defineComponent({
    setup() {
        return {
            syncAsset,

            fastDlUrl: computed(() => {
                if (!state.models.server) return;

                return `${state.models.server.node.fastDlUrl}/${state.models.server.uuidShort}`;
            }),

            sync: () => {
                return useService('fastdl@sync', true)
                    .then(() => {
                        state.alerts.add({
                            type: 'success',
                            title: ['server.fastdl.sync_started'],
                        });
                    });
            },
        };
    },
});
</script>
