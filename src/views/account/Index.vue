<template>
    <div class="flex flex-col lg:flex-row gap-x-4">
        <div class="w-full space-y-4">
            <container title="client.account.update_identity">
                <v-form service-id="account@update" on-success="client.account.updated_identity">
                    <v-input type="hidden" name="action" value="identity" />

                    <div class="grid xl:grid-cols-2 gap-x-6">
                        <v-input class="flex-grow" name="name_first" :value="user?.nameFirst" rule="required" />
                        <v-input class="flex-grow" name="name_last" :value="user?.nameLast" rule="required" />
                    </div>

                    <div class="grid xl:grid-cols-2 gap-x-6">
                        <v-select class="flex-grow" name="preferences.language" prefix="generic.languages" rule="required" :value="currentLanguage" :options="languages" />
                        <v-select
                            class="flex-grow"
                            name="preferences.navbar_position"
                            prefix="client.account.navbar_position"
                            label-prop="name"
                            value-prop="id"
                            rule="required"

                            :value="navbarPosition"
                            :options="[{id:0,name:'left'},{id:1,name:'top'}]"
                        />
                    </div>

                    <div class="text-right">
                        <v-submit color="primary" label="client.account.update_identity" />
                    </div>
                </v-form>
            </container>
            <container title="client.account.update_email">
                <v-form service-id="account@update" on-success="client.account.updated_email">
                    <v-input type="hidden" name="action" value="email" />

                    <v-input label="components.form.fields.new_email" name="email" :value="user?.email" rule="required|email" />
                    <v-input type="password" name="current_password" rule="required" />

                    <div class="text-right">
                        <v-submit color="primary" label="client.account.update_email" />
                    </div>
                </v-form>
            </container>
        </div>

        <div class="w-full space-y-4">
            <container title="client.account.update_password">
                <v-form service-id="account@update" on-success="client.account.updated_password">
                    <v-input type="hidden" name="action" value="password" />

                    <v-input type="password" name="current_password" rule="required" />
                    <v-input type="password" name="new_password" footer="client.account.password_requirements" rule="required" />

                    <v-input type="password" name="new_password_confirmation" rule="required" />

                    <div class="text-right">
                        <v-submit color="primary" label="client.account.update_password" />
                    </div>
                </v-form>
            </container>
            <container title="client.account.quick_login" v-if="ssoEnabled">
                <div class="mb-4">
                    <t path="client.account.quick_login_description" />
                </div>

                <div class="text-right">
                    <v-button color="primary" @click="sso">
                        <t :path="user?.ssoEnabled ? 'client.account.disable_quick_login' : 'client.account.enable_quick_login'" />
                    </v-button>
                </div>
            </container>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { state, dispatch, getAvailableLanguages, getCurrentLanguage } from '~/core';
import { NavBarPosition } from '~/api/models/User';
import { useService } from '~/plugins';

export default defineComponent({
    setup() {
        const redirectURL = `${window.location.origin}/account/sso`;

        const query = new URLSearchParams(window.location.search);
        const [ssoCode, ssoState] = [query.get('code'), query.get('state')];
        if (ssoCode && ssoState) {
            history.replaceState({}, document.title, `${window.location.origin}/account`);

            // TODO: loader for action
            useService('account@update', true, {
                action: 'sso',
                sso_redirect: redirectURL,
                sso_code: ssoCode,
                sso_state: ssoState,
            })
                .then(() => dispatch('user/update', {
                    ssoEnabled: true,
                }));
        }

        return {
            user: computed(() => state.user.data),
            whmcs: computed(() => state.settings.data?.whmcs),
            languages: computed(() => getAvailableLanguages()), // TODO: these should be sorted by alphabet in their respective lang (or don't be translated at all...?)
            currentLanguage: computed(() => getCurrentLanguage()),
            navbarPosition: computed(() => state.user.data?.preferences?.navbarPosition || NavBarPosition.LEFT),

            ssoEnabled: computed(() => state.settings.data?.whmcs?.enabled),
            // TODO: loader for button
            sso: () => useService<{ url: string }>('account@update', true, {
                action: 'sso',
                sso_redirect: redirectURL,
            })
                .then(({ url }) => {
                    if (url) window.location.href = url;
                    else dispatch('user/update', {
                        ssoEnabled: !state.user.data?.ssoEnabled,
                    });
                }),
        };
    },
});
</script>
