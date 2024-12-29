<template>
    <div class="bg-primary-500 p-8 rounded-lg">
        <div class="text-center my-8">
            <fa :icon="['fas', 'fingerprint']" class="h-20 text-white/30" />
        </div>

        <div class="mt-4 text-center">
            <p>
                <t path="login.security_keys.insert_and_touch" />
            </p>

            <p class="mt-2">
                <t path="login.security_keys.not_responding" />
                <span class="text-white/75 cursor-pointer" @click="triggerChallenge">
                    <t path="login.security_keys.not_responding_click_here" />
                </span>
            </p>

            <div class="text-center mt-4">
                <router-link v-if="hasTotp" :to="{name: 'login.totp'}" class="btn btn-warning block w-full mb-2">
                    <t path="login.use_different_method" />
                </router-link>

                <router-link :to="{name: 'login.index'}" class="btn btn-secondary block w-full">
                    <t path="login.back" />
                </router-link>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue';
import * as Sentry from '@sentry/vue';
import { dispatch, Logger, state } from '~/core';
import { useService } from '~/plugins';
import { base64Decode, bufferToString, stringToBuffer, decodeSecurityKeyCredentials } from '~/helpers';

export default defineComponent({
    setup() {
        const challenge = async (): Promise<AuthenticatedCredential> => {
            const publicKey = state.user.mfa!.webauthn!.public_key;

            // Create a new object instead of Object.assign to avoid any potential references
            const publicKeyCredential: PublicKeyCredentialRequestOptions = {
                ...publicKey,
                challenge: Uint8Array.from(
                    atob(base64Decode(publicKey.challenge.toString())),
                    c => c.charCodeAt(0)
                )
            };

            if (publicKey.allowCredentials) {
                publicKeyCredential.allowCredentials = publicKey.allowCredentials.map(cred => ({
                    ...cred,
                    id: Uint8Array.from(
                        atob(base64Decode(cred.id.toString())),
                        c => c.charCodeAt(0)
                    ),
                }));
            }

            // Explicitly type the credential request
            const credential = await navigator.credentials.get({
                publicKey: publicKeyCredential
            });

            if (!credential) {
                throw new Error('No credentials provided for challenge.');
            }

            return credential as AuthenticatedCredential;
        };

        const triggerChallenge = () => {
            dispatch('alerts/clear');

            challenge().then(credential => {
                return useService('authentication@key', true, {
                    id: credential.id,
                    type: credential.type,
                    raw_id: bufferToString(credential.rawId),
                    response: {
                        authenticator_data: bufferToString(credential.response.authenticatorData),
                        client_data_json: bufferToString(credential.response.clientDataJSON),
                        signature: bufferToString(credential.response.signature),
                        user_handle: credential.response.userHandle ? bufferToString(credential.response.userHandle) : null,
                    },
                });
            }).catch(err => {
                // If it's not a DOM exception - useService most likely handled it, else it's a weird error and will be logged.
                if (!(err instanceof DOMException)) return Logger.error('SecurityKeys', err);

                // List of ignored errors
                if (['AbortError', 'NotAllowedError'].includes(err.name)) return;

                let alert = 'generic.something_went_wrong';

                switch(err.name) {
                    case 'InvalidStateError':
                        alert = 'login.security_keys.unknown_key';
                        break;
                    default:
                        Logger.error('SecurityKeyChallenge', `Unknown DOMException occurred: ${err.name}`);
                        Sentry.captureException(err);
                }

                dispatch('alerts/add', {
                    type: 'danger',
                    title: [alert]
                });
            });
        };

        onMounted(() => triggerChallenge());

        return {
            triggerChallenge,
            hasTotp: computed(() => state.user.mfa?.methods?.includes('totp')),
        };
    }
});
</script>
