<template>
    <div class="w-[300px]">
        <v-form service-id="authentication@resetPassword" global class="flex flex-col" on-success="login.password_reset_email_sent">
            <v-input name="email" placeholder="components.form.fields.email" rule="required|email" />

            <v-submit color="primary" label="login.reset_password" />
            <div class="forgot text-center mt-4">
                <router-link :to="{name: 'login.index'}">
                    <t path="login.back" />
                </router-link>
            </div>
        </v-form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    setup(props, context) {
        return {};
    },
});
</script>
