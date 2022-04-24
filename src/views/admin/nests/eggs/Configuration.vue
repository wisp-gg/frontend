<template>
    <v-form :service-id="creating ? 'eggs@create' : 'eggs@update'" :on-success="onSuccess" class="space-y-4">
        <div class="mb-4" v-if="!creating">
            <alert type="warning" icon="info-circle" :title="['admin.nests.egg.daemon_restart_required_after_changes']" />
        </div>

        <container title="admin.nests.egg.configuration">
            <div class="grid lg:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                    <v-input name="name" rule="required" :value="egg?.name" />
                    <v-input name="tag" label="components.form.fields.identifier" :value="egg?.tag" />
                    <v-textarea name="description" :value="egg?.description" />
                </div>

                <div>
                    <v-input name="docker_image" rule="required" :value="egg?.dockerImage" />
                    <v-textarea name="startup" rule="required" :value="egg?.startup" />
                </div>
            </div>
        </container>

        <container title="admin.nests.egg.process_management">
            <alert type="warning" icon="info-circle" title="admin.nests.egg.copy_alert" />

            <div class="mt-4 grid lg:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                    <v-model-select
                        service-id="nests@getAllForSelector"

                        name="config_from"
                        label-prop="name"
                        value-prop="id"
                        group-label-prop="name"
                        group-options-prop="eggs"
                    />
                    <v-textarea name="config_logs" :rows="6" :rule="configRules" :value="egg?.configLogs" />
                    <v-textarea name="config_startup" :rows="6" :rule="configRules" :value="egg?.configStartup" />
                </div>

                <div>
                    <v-input name="config_stop" label="components.form.fields.stop_command" :rule="configRules" :value="egg?.configStop" />
                    <v-textarea name="config_files" :rows="6" :rule="configRules" :value="egg?.configFiles" />
                    <v-textarea name="custom_config" :rows="6" :rule="configRules" :value="egg?.customConfig" />
                </div>
            </div>
        </container>

        <div class="bg-primary-500 flex justify-between p-4 rounded">
            <div class="space-x-4">
                <skeleton v-if="!creating" :content="4">
                    <import-update-modal />
                </skeleton>

                <skeleton v-if="!creating" :content="4">
                    <v-button color="info" permission="egg.read" :href="exportUrl">
                        <t path="generic.export" />
                    </v-button>
                </skeleton>
            </div>

            <div class="space-x-4">
                <skeleton v-if="!creating" :content="4">
                    <delete-egg-modal :egg="egg" />
                </skeleton>

                <v-submit color="primary" :permission="creating ? 'egg.create' : 'egg.update'">
                    <t :path="creating ? 'generic.create' : 'generic.save'" />
                </v-submit>
            </div>
        </div>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import state from '~/state';
import { onModelLoaded } from '~/plugins';
import { Egg } from '~/api/models';
import Alert from '~/components/Alert.vue';
import ImportUpdateModal from './ImportUpdateModal.vue';
import DeleteEggModal from './DeleteEggModal.vue';

export default defineComponent({
    components: { ImportUpdateModal, DeleteEggModal, Alert },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const creating = computed(() => route.name === 'admin.service_management.nests.egg.new');

        const configFrom = ref<number | undefined>();
        onModelLoaded('egg', egg => configFrom.value = egg.configFrom);

        return {
            creating,
            configFrom,
            egg: computed(() => state.models.egg),
            configRules: computed(() => configFrom.value ? '' : 'required'),

            exportUrl: computed(() => `${Wisp.BaseURL}/api/admin/nests/${route.params.nest}/eggs/${route.params.egg}/export`),
            onSuccess: (egg: Egg) => {
                if (creating.value) router.push({
                    name: 'admin.service_management.nests.egg.configuration',
                    params: {
                        egg: egg.id
                    }
                });
            }
        };
    }
});
</script>
