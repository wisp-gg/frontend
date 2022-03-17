<template>
    <div id="modal-target" />

    <router-view v-if="ready" />
    <div v-else class="flex w-full h-screen items-center justify-center py-5 text-white text-2xl opacity-50">
        {{ loadingMessage }}
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeUnmount } from 'vue';
import { Logger, state, getter, loadLanguage, setCurrentLanguage } from '~/core';
import { AuthenticationService, NotificationsService, SettingsService } from '~/api/services/client';

export default defineComponent({
    setup() {
        // We'd use <Suspense> but as this is the parent component, it won't work :(
        const ready = ref(false);
        const loadingMessage = ref('Loading');

        let dots = '';
        let animationTimer: NodeJS.Timeout | null = setInterval(() => {
            dots.length > 3 ? dots = '' : dots += '.';

            loadingMessage.value = 'Loading' + dots;
        }, 300);
        const clearTimer = () => {
            if (animationTimer) {
                clearInterval(animationTimer);
                animationTimer = null;
            }
        };
        onBeforeUnmount(clearTimer);

        Promise.all([
            AuthenticationService.initializeUser(),
            SettingsService.initializeSettings(),
        ])
            .then(async () => {
                // Always load en - it acts as a fallback for missing translations
                await loadLanguage('en');

                const preferredLocale = state.user.data?.preferences?.language || state.settings.data?.default_locale;
                if (preferredLocale) await setCurrentLanguage(preferredLocale);

                ready.value = true;

                if (getter<boolean>('user/loggedIn')) {
                    // Background service
                    NotificationsService.initializeNotifications();
                }
            })
            .catch(err => {
                loadingMessage.value = 'Something went wrong. Try refreshing the page or come back later.';

                Logger.error('App', 'Initialization failed', err);
            })
            .finally(clearTimer);

        return {
            ready,
            loadingMessage,
        };
    }
});
</script>
