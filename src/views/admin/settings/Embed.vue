<template>
    <container title="admin.settings.embed.embed_settings">
        <v-form service-id="settings@updateEmbed">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                <v-input name="og.site_name" footer="admin.settings.embed.site_name_footer" :value="og?.site_name" />
                <v-input name="og.title" footer="admin.settings.embed.title_footer" :value="og?.title" />
                <v-input name="og.description" footer="admin.settings.embed.description_footer" :value="og?.description" />
                <v-input name="og.image" footer="admin.settings.embed.image_footer" :value="og?.image" />
            </div>

            <div class="text-right">
                <v-submit no-margin color="primary" permission="settings.update">
                    <t path="generic.save" />
                </v-submit>
            </div>
        </v-form>
    </container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import state from '~/state';

export default defineComponent({
    setup(props, context) {
        return {
            og: state.settings.data?.og,
        };
    },
});
</script>
