<template>
    <container title="admin.settings.whmcs.sso_integration">
        <v-form service-id="settings@updateSSO">
            <!-- TODO: Hyperlink "the guide" instead of directly putting link cus it looks tacky -->
            <alert type="info" icon="info-circle" title="admin.settings.whmcs.whmcs_notice" />

            <v-switch class="mt-8" name="whmcs.enabled" footer="admin.settings.whmcs.sso_enabled_footer" :value="whmcs?.enabled" />

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-x-8">
                <v-input name="whmcs.button_text" footer="admin.settings.whmcs.button_text_footer" :value="whmcs?.button_text" />
                <v-input name="whmcs.url" footer="admin.settings.whmcs.url_footer" :value="whmcs?.url" />
                <v-input name="whmcs.client_id" footer="admin.settings.whmcs.client_id_footer" :value="whmcs?.client_id" />
                <v-input name="whmcs.client_secret" footer="admin.settings.whmcs.client_secret_footer" type="password" :placeholder="whmcs?.client_secret" />
                <v-input name="whmcs.api_id" footer="admin.settings.whmcs.api_id_footer" :value="whmcs?.api_id" />
                <v-input name="whmcs.api_secret" footer="admin.settings.whmcs.api_secret_footer" type="password" :placeholder="whmcs?.api_secret" />
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
import { state } from '~/core';

export default defineComponent({
    setup(props, context) {
        return {
            whmcs: state.settings.data?.whmcs,
        };
    },
});
</script>
