<template>
    <div class="bg-primary-500 p-8 rounded-lg">
        <div class="text-center">
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
                <router-link :to="{name: 'login.totp'}" class="btn btn-warning block w-full mb-2">
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
import { computed, defineComponent, onMounted, ref } from 'vue';
import { dispatch, state } from '~/core';
import { useService } from '~/plugins';
import { base64Decode, bufferDecode, bufferEncode, decodeSecurityKeyCredentials } from '~/helpers';

export default defineComponent({
    setup() {
        const abortController = ref(new AbortController());

        const challenge = async (): Promise<AuthenticatedCredential> => {
            const publicKey = state.user.mfa!.webauthn!.public_key;
            const publicKeyCredential = Object.assign({}, publicKey);

            publicKeyCredential.challenge = bufferDecode(base64Decode(publicKey.challenge.toString()));
            if (publicKey.allowCredentials) {
                publicKeyCredential.allowCredentials = decodeSecurityKeyCredentials(publicKey.allowCredentials);
            }

            const credential = await navigator.credentials.get({ signal: abortController.value.signal, publicKey: publicKeyCredential }) as AuthenticatedCredential | null;
            if (!credential) throw new Error('No credentials provided for challenge.');

            return credential;
        };

        const triggerChallenge = () => {
            dispatch('alerts/clear');

            challenge().then(credential => {
                return useService('authentication@key', true, {
                    id: credential.id,
                    type: credential.type,
                    raw_id: bufferEncode(credential.rawId),
                    response: {
                        authenticator_data: bufferEncode(credential.response.authenticatorData),
                        client_data_json: bufferEncode(credential.response.clientDataJSON),
                        signature: bufferEncode(credential.response.signature),
                        user_handle: credential.response.userHandle ? bufferEncode(credential.response.userHandle) : null,
                    },
                });
            }).catch(err => {
                // If its not a DOM exception - useService most likely handled it, else it's a weird error and will be logged.
                if (!(err instanceof DOMException)) return console.error(err);

                // List of ignored errors
                if (['AbortError'].includes(err.name)) return;

                let alert = 'generic.something_went_wrong';

                switch(err.name) {
                    case 'InvalidStateError':
                        alert = 'login.security_keys.unknown_key';
                        break;
                    default:
                        console.warn('Unknown DOMException occurred', err.name);
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
