<template>
    <div class="flex flex-grow flex-col justify-center items-center py-5 darker-input">
        <alerts class="mb-4" />

        <img class="mb-4" :src="logo" height="40" width="200" :alt="name">

        <router-view />
    </div>

    <v-footer />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { state } from '~/core';
import fullLogo from '~/assets/svg/wisp/full_logo.svg';

export default defineComponent({
    setup() {
        return {
            name: computed(() => state.settings.data?.branding?.name || 'WISP'),
            logo: computed(() => state.settings.data?.branding?.login_logo || fullLogo),
        };
    },
});
</script>
