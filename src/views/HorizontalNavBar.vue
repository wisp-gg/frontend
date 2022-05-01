<template>
    <nav class="flex justify-center items-stretch h-20 p-3 nav-primary">
        <div class="flex justify-between items-center container">
            <div class="flex">
                <div class="flex items-center">
                    <router-link :to="{name: 'index'}" class="pt-2 pb-2">
                        <img :src="logo" class="h-10" :alt="name">
                    </router-link>
                </div>
                <div v-if="server" class="flex ml-4 text-white text-opacity-75">
                    <server-widget />
                </div>
            </div>

            <div class="flex justify-end items-center py-3 space-x-12">
                <v-button :to="{name: adminRoute}" class="relative text-lg text-white text-opacity-50 hover:text-opacity-80" v-if="user?.rootAdmin || user?.supportOp">
                    <fa :icon="['fas', 'cogs']" class="cursor-pointer" />
                </v-button>
                <div class="mx-auto relative" v-if="announcementsEnabled">
                    <announcements />
                </div>
                <div class="mx-auto relative">
                    <notifications />
                </div>

                <v-button class="ml-auto mr-3 text-lg text-white text-opacity-50 hover:text-opacity-80" @click="logout">
                    <fa :icon="['fas', 'sign-out-alt']" />
                </v-button>

                <router-link :to="{name: 'account.settings.details'}">
                    <avatar :email="email" class="rounded-full h-10" />
                </router-link>
            </div>
        </div>
    </nav>

    <nav class="flex justify-center items-stretch h-14 nav-secondary">
        <div class="flex justify-start items-stretch container flex-grow">
            <ul class="flex flex-grow items-center">
                <li v-for="route of routes">
                    <p v-if="route.routes" class="router-link p-7 cursor-pointer" :class="route.active ? ['router-link-exact-active'] : []" @mouseenter="onHover(route)">
                        <t :path="`navigation.${route.displayName}.title`" />
                    </p>

                    <v-button v-else :to="{name: route.name, params: route.params}" :permission="route.permission" class="router-link p-7">
                        <t :path="`navigation.${route.displayName}.title`" />
                    </v-button>
                </li>
            </ul>
        </div>
    </nav>

    <nav v-if="hoveredCategory" class="flex justify-center items-stretch h-14">
        <div class="flex justify-start items-stretch container flex-grow">
            <ul class="flex flex-grow items-center">
                <li v-for="route of hoveredCategory.routes">
                    <v-button :to="{name: route.name, params: route.params}" :permission="route.permission" class="router-link p-7">
                        <t :path="`navigation.${route.displayName}.title`" />
                    </v-button>
                </li>
            </ul>
        </div>
    </nav>
</template>

<style scoped>
    .nav-primary {
        background: #242344;
    }

    .nav-primary li {
        padding-left: 15px;
        padding-right: 15px;
    }

    .nav-primary li:last-child {
        padding-left: 25px;
        padding-right: 0;
    }

    .icon {
        font-size: 20px;
        color: hsla(0, 0%, 100%, .75);
        margin: 0.5rem;
        padding-top: 2px;
    }

    .iconSubmit {
        margin-top: 0;
        padding: 0;
        outline: none;
    }

    .iconSubmit:hover svg {
        color: #fff;
    }

    .nav-secondary {
        background: #1d1c39;
    }

    .nav-secondary li:first-child a {
        padding-left: 0;
    }
</style>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { state, Store } from '~/core';
import { useService, hasFeatures } from '~/plugins';
import { RouteData } from '~/store/modules/navigation';
import fullLogo from '~/assets/svg/wisp/full_logo.svg';
import ServerWidget from '~/views/ServerWidget.vue';
import Announcements from '~/views/Announcements.vue';
import Notifications from '~/views/Notifications.vue';

export default defineComponent({
    components: { Notifications, Announcements, ServerWidget },
    setup() {
        const route = useRoute();
        const hoveredCategory = ref<RouteData | null>(null);

        Store.subscribe(mutation => {
            if (mutation.type === 'navigation/setCurrentRoute') {
                if (hoveredCategory.value && !mutation.payload.name.startsWith(hoveredCategory.value.name)) {
                    hoveredCategory.value = null;
                }
            }
        });

        return {
            routes: computed(() =>
                state.navigation.routes
                    .filter(route => route.feature ? hasFeatures(route.feature) : true)
                    .map(route => Object.assign({}, route)) // Copy so that we don't affect vuex store
                    .map(route => {
                        route.routes = route.routes?.filter(route => route.feature ? hasFeatures(route.feature) : true);

                        return route;
                    })
                    .filter(route => route.routes ? route.routes.length > 0 : true)
            ),
            hoveredCategory,

            user: computed(() => state.user.data),
            server: computed(() => state.models.server),

            name: computed(() => state.settings.data?.branding?.name || 'WISP'),
            logo: computed(() => state.settings.data?.branding?.logo || fullLogo),
            email: computed(() => state.user.data?.email),

            adminRoute: computed(() => route.name?.toString().startsWith('admin.') ? 'index' : 'admin.administration.index'),

            announcementsEnabled: computed(() => hasFeatures('general:announcements')),

            logout: () => useService('client:authentication@logout', true),

            onHover: (route: RouteData) => {
                hoveredCategory.value = route;
            }
        };
    },
});
</script>
