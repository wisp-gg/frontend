<!--suppress HtmlUnknownTarget -->
<template>
    <div id="login" class="w-[300px]">
        <v-form id="loginForm" service-id="authentication@login" global>
            <v-input type="hidden" name="method" value="credentials" />
            <v-input name="email" placeholder="components.form.fields.email" rule="required|email" hide-label class="rounded-b-none" />
            <v-input name="password" placeholder="components.form.fields.password" type="password" rule="required" hide-label class="mb-4 rounded-t-none" />

            <v-submit class="block w-full" color="primary" label="login.sign_in" />
        </v-form>

        <template v-if="ssoEnabled">
            <div class="login-or my-3 text-center">
                <t path="login.or" />
            </div>

            <v-button class="w-full" color="secondary" @click="sso">
                <t path="login.sso" />
            </v-button>
        </template>

        <div class="text-center mt-3">
            <router-link :to="{name: 'login.reset_password'}" class="forgot">
                <t path="login.reset_password" />
            </router-link>
        </div>
    </div>
</template>

<style lang="scss">
    #loginForm {
        .rounded-b-none input {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
        }

        .rounded-t-none input {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }
    }

    .login-or {
        position: relative;
        display: block;
        color: rgba(255, 255, 255, .5);
    }

    .login-or::before, .login-or::after {
        content: '';
        display: block;
        width: calc(50% - 1.5rem);
        height: 1px;
        background: rgba(255,255,255,.25);
        position: absolute;
        top: 50%;
        -webkit-transform: translateY(-50%);
        transform: translateY(-50%);
    }

    .login-or::before {
        left: 0;
    }

    .login-or::after {
        right: 0;
    }

    .forgot {
        color: rgba(26, 212, 168, .5);
        -webkit-transition: .2s ease-in-out color;
        -moz-transition: .2s ease-in-out color;
        -o-transition: .2s ease-in-out color;
        transition: .2s ease-in-out color;
    }

    .forgot:hover {
        color: #1ad4a8;
        text-decoration: none;
    }
</style>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { state } from '~/core';
import { useService } from '~/plugins';

export default defineComponent({
    setup() {
        const redirectURL = `${window.location.origin}/auth/login/sso`;

        const query = new URLSearchParams(window.location.search);
        const [ssoCode, ssoState] = [query.get('code'), query.get('state')];
        if (ssoCode && ssoState) {
            history.replaceState({}, document.title, `${window.location.origin}/login`);

            // TODO: loader for action
            useService('authentication@login', true, {
                method: 'sso',

                sso_redirect: redirectURL,
                state: ssoState,
                code: ssoCode,
            });
        }

        return {
            ssoEnabled: computed(() => state.settings.data?.whmcs?.enabled),

            sso: () => useService<{ url: string }>('authentication@login', true, {
                method: 'sso',
                sso_redirect: redirectURL,
            }),

            showModal: ref(false),
            showNestedModal: ref(false),
        };
    },
});
</script>
