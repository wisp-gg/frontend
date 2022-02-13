<template>
    <modal opener-text="generic.create" v-slot="{ close }">
        <h1 class="text-xl text-white text-opacity-75 mb-6">
            <t path="client.security.create_credentials" />
        </h1>

        <v-form service-id="security@createCredential" :on-success="() => { close('success', ['client.security.api_key_generated']); updateList(); }">
            <v-input type="hidden" name="action" value="password" />

            <v-input name="memo" footer="client.security.memo_description" rule="required" />
            <v-select
                name="allowed_ips"
                footer="client.security.allowed_ips_description"
                mode="tags"
                taggable
                no-translate
            />

            <div class="text-right space-x-4">
                <v-submit color="primary" label="generic.create" />
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dispatch } from '~/core';

export default defineComponent({
    setup(props, context) {
        return {
            updateList: () => dispatch('lists/refresh', 'account@getCredentials'),
        };
    }
});
</script>
