<template>
    <container title="admin.settings.general.panel_settings">
        <v-form service-id="settings@updateGeneral">
            <div class="flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
                <div class="lg:w-1/3">
                    <v-input name="branding.name" footer="admin.settings.general.company_name_footer" :value="settings?.branding?.name" />
                    <v-switch name="misc.databases_allow_random" footer="admin.settings.general.random_database_deployment_footer" :value="settings?.misc?.databases_allow_random" />
                </div>
                <div class="lg:w-1/3">
                    <v-radio-group name="misc.required_2fa" prefix="admin.settings.general.require_2fa" :options="['not_required', 'admin_only', 'all_users']" footer="admin.settings.general.require_2fa_footer" :value="settings?.misc?.required_2fa" />
                </div>
                <div class="lg:w-1/3">
                    <v-select name="default_locale" prefix="generic.languages" footer="admin.settings.general.default_language_footer" :options="languages" rule="required" :value="settings?.default_locale" />
                </div>
            </div>

            <div class="text-right">
                <v-submit color="primary" permission="settings.update">
                    <t path="generic.save" />
                </v-submit>
            </div>
        </v-form>
    </container>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { state, getAvailableLanguages } from '~/core';

export default defineComponent({
    setup(props, context) {
        return {
            settings: state.settings.data,
            languages: computed(() => getAvailableLanguages()),
        };
    },
});
</script>
