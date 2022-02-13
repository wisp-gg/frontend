<template>
    <div id="login" class="w-[300px]">
        <v-form service-id="authentication@totp" global>
            <!-- TODO: possibly a question mark tooltip that explains the account has 2fa enabled and they need it from auth app? (otherwise contact admin) -->
            <v-input name="token" label="login.two_factor_token" placeholder="components.form.fields.token" rule="required" class="mb-4 rounded-t-none" />

            <v-submit class="block w-full" color="primary" label="login.sign_in" />
        </v-form>

        <div class="text-center mt-3">
            <router-link :to="{name: 'login.index'}" class="btn btn-secondary block w-full">
                <t path="login.back" />
            </router-link>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({

});
</script>
