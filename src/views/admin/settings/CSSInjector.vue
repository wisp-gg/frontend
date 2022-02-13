<template>
    <container no-padding title="admin.settings.css_injector.title">
        <alert class="m-4" type="info" icon="info-circle" title="admin.settings.css_injector.minification_notice" />
        <alert class="m-4" type="warning" icon="info-circle" title="admin.settings.refresh_page_to_apply_changes" />

        <skeleton :content="64">
            <v-form class="pt-4" service-id="settings@updateCSS">
                <!-- TODO: Fix editor requiring path to infer mode, just allow setting mode instead -->
                <v-editor class="border-b border-primary-400" name="css" path="editor.css" :value="content" />

                <div class="text-right p-4">
                    <v-submit no-margin color="primary" permission="settings.update">
                        <t path="generic.save" />
                    </v-submit>
                </div>
            </v-form>
        </skeleton>
    </container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { state } from '~/core';
import { useService } from '~/plugins';

export default defineComponent({
    setup(props, context) {
        const content = ref('');

        if (state.settings.data?.injector?.css) {
            useService<string>('settings@fetchAsset', true, state.settings.data?.injector?.css)
                .then(asset => content.value = asset);
        }

        return {
            content,
        };
    },
});
</script>
