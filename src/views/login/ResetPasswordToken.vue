<template>
    <div class="w-[300px]">
        <v-form service-id="authentication@resetPasswordToken" global class="flex flex-col">
            <v-input type="hidden" name="token" :value="route.params.token" rule="required" />
            <v-input type="hidden" name="email" :value="route.query.email" rule="required|email" />
            <v-input type="password" name="new_password" rule="required" />
            <v-input type="password" name="new_password_confirmation" rule="required" />

            <v-submit color="primary" label="generic.reset_password" />
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
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
    setup(props, context) {
        const Router = useRouter();
        const route = useRoute();

        if (!route.params.token || !route.query.email) {
            Router.push({
                name: 'login.reset_password',
            });
            return;
        }

        return {
            route,
        };
    },
});
</script>
