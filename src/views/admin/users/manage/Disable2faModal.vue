<template>
    <modal v-slot="{ close }" title="admin.users.disable_2fa" permission="user.update" opener-color="warning" opener-text="admin.users.disable_2fa">
        <div class="flex items-center">
            <p class="flex-grow text-md">
                <t path="admin.users.disable_2fa_notice" />
            </p>

            <v-button color="primary" @click="submit().then(() => close('success', ['admin.users.2fa_disabled']))">
                <t path="generic.submit" />
            </v-button>
        </div>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useService } from '~/plugins';

export default defineComponent({
    setup() {
        return {
            submit: () => useService('users@disable2FA', 'admin.users.disable_2fa'),
        };
    }
});
</script>
