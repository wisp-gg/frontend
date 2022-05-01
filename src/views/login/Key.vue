<template>
    <div class="bg-primary-500 p-8 rounded-lg">
        <p>imagine the security key popup rn</p>

        <div class="text-center mt-3">
            <router-link :to="{name: 'login.totp'}" class="btn btn-warning block w-full mb-2">
                <t path="login.use_different_method" />
            </router-link>

            <router-link :to="{name: 'login.index'}" class="btn btn-secondary block w-full">
                <t path="login.back" />
            </router-link>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { state } from '~/core';
import { useService } from '~/plugins';
import { base64Decode, bufferDecode, bufferEncode, decodeSecurityKeyCredentials } from '~/helpers';

export default defineComponent({
    setup() {
        const abortController = ref(new AbortController());

        const triggerChallenge = async () => {
            const publicKey = state.user.mfa!.webauthn!.public_key;
            const publicKeyCredential = Object.assign({}, publicKey); // Create a copy otherwise vuex has a cry about mutating state out of actions

            publicKeyCredential.challenge = bufferDecode(base64Decode(publicKey.challenge.toString()));
            if (publicKey.allowCredentials) {
                publicKeyCredential.allowCredentials = decodeSecurityKeyCredentials(publicKey.allowCredentials);
            }

            // TODO: Handle if an unknown key was pressed - it seems to silently throw an error
            const credential = await navigator.credentials.get({ signal: abortController.value.signal, publicKey: publicKeyCredential }) as AuthenticatedCredential | null;
            if (!credential) return Promise.reject(new Error('No credentials provided for challenge.'));

            await useService('authentication@key', true, {
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
        };

        onMounted(() => triggerChallenge());

        return {
            triggerChallenge,
            hasTotp: computed(() => state.user.mfa?.methods?.includes('totp')),
        };
    }
});
</script>
