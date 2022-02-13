<template>
    <v-form service-id="eggs@updateScripts" class="space-y-4">
        <container no-padding title="admin.nests.egg.install_script">
            <skeleton :content="64">
                <v-editor class="border-b border-primary-400" name="script_install" path="install.sh" :value="egg?.scriptInstall" />
            </skeleton>

            <div class="grid grid-cols-3 justify-between p-4 gap-x-4">
                <v-model-select
                    service-id="nests@getAllForSelector"
                    parameter="name"

                    label="components.form.fields.copy_script_from"
                    name="copy_update_script_from"
                    label-prop="name"
                    value-prop="id"
                    group-label-prop="name"
                    group-options-prop="eggs"

                    :value="egg?.copyUpdateScriptFrom"
                />

                <v-input name="script_container" :value="egg?.scriptContainer" />
                <v-input name="script_entry" :value="egg?.scriptEntry" />
            </div>
        </container>

        <container no-padding title="admin.nests.egg.update_script">
            <skeleton :content="64">
                <v-editor class="border-b border-primary-400" name="script_update" path="install.sh" :value="egg?.scriptUpdate" />
            </skeleton>

            <div class="grid grid-cols-3 justify-between p-4 gap-x-4">
                <v-model-select
                    service-id="nests@getAllForSelector"
                    parameter="name"

                    label="components.form.fields.copy_script_from"
                    name="copy_update_script_from"
                    label-prop="name"
                    value-prop="id"
                    group-label-prop="name"
                    group-options-prop="eggs"

                    :value="egg?.copyUpdateScriptFrom"
                />

                <v-input label="components.form.fields.script_container" name="script_update_container" :value="egg?.scriptUpdateContainer" />
                <v-input label="components.form.fields.script_entry" name="script_update_entry" :value="egg?.scriptUpdateEntry" />
            </div>
        </container>

        <div class="bg-primary-500 p-4 rounded text-right space-x-4">
            <v-submit color="primary" permission="egg.update">
                <t path="generic.save" />
            </v-submit>
        </div>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';

export default defineComponent({
    setup() {
        return {
            egg: computed(() => state.models.egg),
        };
    }
});
</script>
