<template>
    <modal has-alerts v-slot="{ close }" title="client.security_keys.create_security_key" opener-color="success" opener-text="generic.create">
        <v-form :service-id="data => register(data, close)">
            <v-input name="name" rule="required" />

            <div class="text-right space-x-4">
                <v-submit color="primary" label="generic.submit" />
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dispatch, Logger } from '~/core';
import { useService } from '~/plugins';
import { base64Decode, bufferToString, decodeSecurityKeyCredentials } from '~/helpers';
import { RegisterResponse } from '~/api/services/client/securityKeys';

export default defineComponent({
    setup() {
        const challenge = async (publicKey: any): Promise<PublicKeyCredential> => {
            // First decode the base64 challenge, then convert to Uint8Array
            publicKey.challenge = Uint8Array.from(
                atob(base64Decode(publicKey.challenge)),
                c => c.charCodeAt(0)
            );

            publicKey.user.id = Uint8Array.from(
                publicKey.user.id,
                (c: string) => c.charCodeAt(0)
            );

            if (publicKey.excludeCredentials) {
                publicKey.excludeCredentials = decodeSecurityKeyCredentials(publicKey.excludeCredentials);
            }

            const credential = await navigator.credentials.create({ publicKey });
            if (!credential || credential.type !== 'public-key') {
                throw new Error(`Unexpected type returned by navigator.credentials.create(): expected "public-key", got "${credential?.type}"`);
            }

            return credential as PublicKeyCredential;
        };

        return {
            register: (data: { name: string }, close: () => void) => useService<RegisterResponse>('securityKeys@register', 'client.security_keys.create_security_key')
                .then(async (res: RegisterResponse) => {
                    challenge(res.credentials)
                        .then(async credential => {
                            await useService('securityKeys@create', 'client.security_keys.create_security_key', {
                                name: data.name,
                                token_id: res.token_id,
                                registration: {
                                    id: credential.id,
                                    type: credential.type,
                                    raw_id: bufferToString(credential.rawId),
                                    response: {
                                        attestation_object: bufferToString((credential.response as AuthenticatorAttestationResponse).attestationObject),
                                        client_data_json: bufferToString(credential.response.clientDataJSON),
                                    },
                                },
                            });

                            await dispatch('lists/refresh', 'securityKeys@getAll');
                            close();
                        }).catch(err => {
                            // If it's not a DOM exception - useService most likely handled it, else it's a weird error and will be logged.
                            if (!(err instanceof DOMException)) return Logger.error('SecurityKeys', err);

                            // List of ignored errors
                            if (['AbortError', 'NotAllowedError'].includes(err.name)) return;
                        });
                }),
        };
    }
});
</script>
