<template>
    <div class="grid grid-cols-1 gap-y-4 gap-x-4 lg:grid-cols-3">
        <v-form service-id="settings@uploadLoginLogo">
            <container title="admin.settings.branding.login_screen_logo">
                <v-image name="asset" :image="branding?.login_logo || fullLogo" :height="100" extensions="png,jpg,jpeg,svg" accept="image/*" />

                <p class="text-center mt-3">
                    <span class="font-bold mr-1">
                        <t path="admin.settings.branding.recommended_size" />
                    </span>

                    <t path="admin.settings.branding.login_screen_logo_recommended_size" />
                </p>

                <p class="text-center">
                    <span class="font-bold mr-1">
                        <t path="admin.settings.branding.formats" />
                    </span>

                    <t path="admin.settings.branding.login_screen_logo_recommended_formats" />
                </p>

                <div class="mt-3 text-right space-x-4">
                    <v-form service-id="settings@uploadLoginLogo" class="inline-block">
                        <v-submit color="danger" permission="settings.update">
                            <t path="generic.reset" />
                        </v-submit>
                    </v-form>

                    <v-submit color="primary" permission="settings.update">
                        <t path="generic.save" />
                    </v-submit>
                </div>
            </container>
        </v-form>

        <v-form service-id="settings@uploadFavicon">
            <container title="admin.settings.branding.favicon">
                <v-image name="asset" :image="branding?.favicon || favicon" :height="32" :width="32" extensions="ico" accept="image/x-icon" />

                <p class="text-center mt-3">
                    <span class="font-bold mr-1">
                        <t path="admin.settings.branding.recommended_size" />
                    </span>

                    <t path="admin.settings.branding.favicon_recommended_size" />
                </p>

                <p class="text-center">
                    <span class="font-bold mr-1">
                        <t path="admin.settings.branding.formats" />
                    </span>

                    <t path="admin.settings.branding.favicon_recommended_formats" />
                </p>

                <div class="mt-3 text-right space-x-4">
                    <v-form service-id="settings@uploadFavicon" class="inline-block">
                        <v-submit color="danger" permission="settings.update">
                            <t path="generic.reset" />
                        </v-submit>
                    </v-form>

                    <v-submit color="primary" permission="settings.update">
                        <t path="generic.save" />
                    </v-submit>
                </div>
            </container>
        </v-form>

        <v-form service-id="settings@uploadLogo">
            <container title="admin.settings.branding.panel_logo">
                <v-image name="asset" :image="branding?.logo || fullLogo" :height="50" :width="230" extensions="png,jpg,jpeg,svg" accept="image/*" />

                <p class="text-center mt-3">
                    <span class="font-bold mr-1">
                        <t path="admin.settings.branding.recommended_size" />
                    </span>

                    <t path="admin.settings.branding.panel_logo_recommended_size" />
                </p>

                <p class="text-center">
                    <span class="font-bold mr-1">
                        <t path="admin.settings.branding.formats" />
                    </span>

                    <t path="admin.settings.branding.panel_logo_recommended_formats" />
                </p>

                <div class="mt-3 text-right space-x-4">
                    <v-form service-id="settings@uploadLogo" class="inline-block">
                        <v-submit color="danger" permission="settings.update">
                            <t path="generic.reset" />
                        </v-submit>
                    </v-form>

                    <v-submit color="primary" permission="settings.update">
                        <t path="generic.save" />
                    </v-submit>
                </div>
            </container>
        </v-form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import state from '~/state';
import fullLogo from '~/assets/svg/wisp/full_logo.svg';
import favicon from '~/assets/png/wisp/favicon.png';

export default defineComponent({
    setup(props, context) {
        return {
            favicon,
            fullLogo,
            branding: state.settings.data?.branding,
        };
    },
});
</script>
