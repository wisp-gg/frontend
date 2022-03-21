<template>
    <div class="h-screen flex flex-col items-stretch fixed w-full md:w-64 nav-primary z-40">
        <div class="flex justify-between items-center border-b border-white border-opacity-10 py-4 px-6">
            <router-link :to="{name: 'index'}">
                <img :src="logo" class="h-8" :alt="name">
            </router-link>
        </div>

        <section class="flex flex-col flex-grow">
            <div v-if="server" class="border-b border-white border-opacity-10 text-white text-opacity-75">
                <server-widget />
            </div>

            <nav class="flex-grow relative overflow-y-auto">
                <ul class="absolute top-0 left-0 w-full">
                    <template v-for="(route, idx) of routes">
                        <nav-dropdown v-if="route.routes" :name="`navigation.${route.name}.title`" :active="route.active" :key="idx">
                            <ul>
                                <li v-for="(child, childIdx) of route.routes" class="px-3 py-2 border-l border-white border-opacity-10" :key="childIdx">
                                    <v-button :to="{name: child.name, params: child.params}" :permission="child.permission" class="router-link flex justify-between" @click="open = false">
                                        <p><t :path="`navigation.${child.displayName}.title`" /></p>
                                    </v-button>
                                </li>
                            </ul>
                        </nav-dropdown>
                        <li v-else class="px-6 py-3" :key="`1-${idx}`">
                            <v-button :to="{name: route.name, params: route.params}" :permission="route.permission" class="router-link flex justify-between" span-class="!block" @click="open = false">
                                <p><t :path="`navigation.${route.displayName}.title`" /></p>
                                <p :class="route.active ? ['text-accent-500'] : ['text-white']">
                                    &bull;
                                </p>
                            </v-button>
                        </li>
                    </template>
                </ul>
            </nav>

            <div class="justify-end z-10">
                <div class="flex items-center py-3 bg-primary-800 border-t border-white border-opacity-10">
                    <v-button :to="{name: adminRoute}" class="mx-auto relative text-lg text-white text-opacity-50 hover:text-opacity-80" v-if="user?.rootAdmin || user?.supportOp">
                        <fa :icon="['fas', 'cogs']" class="cursor-pointer" />
                    </v-button>
                    <div class="mx-auto relative" v-if="announcementsEnabled">
                        <announcements />
                    </div>
                    <div class="mx-auto relative">
                        <notifications />
                    </div>
                </div>

                <div class="flex items-center px-6 py-3 bg-primary-800 border-t border-white border-opacity-10">
                    <router-link :to="{name: 'account.settings'}">
                        <avatar :email="user?.email" class="rounded-full h-10 mr-3" />
                    </router-link>
                    <div>
                        <p>{{ user?.fullName }}</p>
                        <!-- TODO: come up with better use cases for "roles" until we have rbac -->
                        <p class="uppercase text-sm text-white text-opacity-40 tracking-wider" v-if="user?.rootAdmin">
                            admin
                        </p>
                        <p class="uppercase text-sm text-white text-opacity-40 tracking-wider" v-else-if="user?.supportOp">
                            support op
                        </p>
                        <p class="uppercase text-sm text-white text-opacity-40 tracking-wider" v-else>
                            user
                        </p>
                    </div>
                    <v-button class="ml-auto mr-3 text-lg text-white text-opacity-50 hover:text-opacity-80" @click="logout">
                        <fa :icon="['fas', 'sign-out-alt']" class="icon" />
                    </v-button>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
    .nav-primary {
        background: #121026;
        color: #B8B9BE;
    }

    .nav-primary li {
        transition: 300ms;
    }

    .dropdown li {
        color: #fff;
        padding: 0;
    }

    .dropdown li:first-child {
        margin-top: 10px;
    }

    .dropdown li::before {
        content: none;
    }
</style>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { state } from '~/core';
import { useService, hasFeatures } from '~/plugins';
import NavDropdown from './NavDropdown.vue';
import Notifications from './Notifications.vue';
import Announcements from './Announcements.vue';
import ServerWidget from './ServerWidget.vue';
import fullLogo from '~/assets/svg/wisp/full_logo.svg';

export default defineComponent({
    components: {
        NavDropdown,
        Notifications,
        Announcements,
        ServerWidget,
    },
    setup() {
        const route = useRoute();

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
            server: computed(() => state.models.server),

            name: computed(() => state.settings.data?.branding?.name || 'WISP'),
            logo: computed(() => state.settings.data?.branding?.logo || fullLogo),
            user: computed(() => state.user.data),

            adminRoute: computed(() => route.name?.toString().startsWith('admin.') ? 'index' : 'admin.administration.index'),

            announcementsEnabled: computed(() => hasFeatures('general:announcements')),

            logout: () => useService('client:authentication@logout', true),
        };
    }
});
</script>
