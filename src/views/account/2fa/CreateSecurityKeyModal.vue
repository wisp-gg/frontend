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
import { startRegistration } from '@simplewebauthn/browser';
import { dispatch, Logger } from '~/core';
import { useService } from '~/plugins';
import { RegisterResponse } from '~/api/services/client/securityKeys';

export default defineComponent({
    setup() {
        return {
            register: (data: { name: string }, close: () => void) => useService<RegisterResponse>('securityKeys@register', 'client.security_keys.create_security_key')
                .then(async (res: RegisterResponse) => {
                    const publicKeyCredentialCreationOptions = {
                        ...res.credentials,
                        user: {
                            ...res.credentials.user,
                            id: btoa(res.credentials.user.id)  // Convert the raw user ID to base64url
                                .replace(/\+/g, '-')
                                .replace(/\//g, '_')
                                .replace(/=/g, '')
                        }
                    };


                    startRegistration({ optionsJSON: publicKeyCredentialCreationOptions })
                        .then(async credential => {
                            await useService('securityKeys@create', 'client.security_keys.create_security_key', {
                                name: data.name,
                                token_id: res.token_id,
                                registration: {
                                    id: credential.id,
                                    type: credential.type,
                                    raw_id: credential.rawId,
                                    response: {
                                        attestation_object: credential.response.attestationObject,
                                        client_data_json: credential.response.clientDataJSON,
                                    },
                                },
                            });

                            await dispatch('lists/refresh', 'securityKeys@getAll');
                            close();
                        }).catch(err => {
                            console.log(err);

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
