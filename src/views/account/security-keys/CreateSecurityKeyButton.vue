<template>
    <modal has-alerts v-slot="{ close }" title="client.security_keys.create_security_key" opener-color="success" opener-text="generic.create">
        <v-form :service-id="register">
            <v-input name="name" rule="required" />

            <div class="text-right space-x-4">
                <v-submit color="primary" label="generic.submit" />
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RegisterResponse } from '~/api/services/client/securityKeys';
import { base64Decode, bufferEncode, bufferDecode, decodeSecurityKeyCredentials } from '~/helpers';
import { useService } from '~/plugins';

export default defineComponent({
    setup() {
        return {
            register: (data: { name: string }) => useService<RegisterResponse>('securityKeys@register', 'client.security_keys.create_security_key')
                .then(async (res: RegisterResponse) => {
                    const publicKey = res.credentials;
                    publicKey.challenge = bufferDecode(base64Decode(publicKey.challenge));
                    publicKey.user.id = bufferDecode(publicKey.user.id);

                    if (publicKey.excludeCredentials) {
                        publicKey.excludeCredentials = decodeSecurityKeyCredentials(publicKey.excludeCredentials);
                    }

                    const credentials = await navigator.credentials.create({ publicKey });
                    if (!credentials || credentials.type !== 'public-key') {
                        throw new Error(`Unexpected type returned by navigator.credentials.create(): expected "public-key", got "${credentials?.type}"`);
                    }

                    const credential = credentials as PublicKeyCredential; // Re-cast it now we've ensured it's of type public-key

                    await useService('securityKeys@create', 'client.security_keys.create_security_key', {
                        name: data.name,
                        token_id: res.token_id,
                        registration: {
                            id: credential.id,
                            type: credential.type,
                            rawId: bufferEncode(credential.rawId),
                            response: {
                                attestation_object: bufferEncode((credential.response as AuthenticatorAttestationResponse).attestationObject),
                                client_data_json: bufferEncode(credential.response.clientDataJSON),
                            },
                        },
                    });
                }),
        };
    }
});
</script>
