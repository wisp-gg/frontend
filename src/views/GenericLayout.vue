<template>
    <template v-if="alerts.find(r => r.title[0].startsWith('server.errors'))">
        <server-error />
    </template>
    <template v-else>
        <announcement-bar />
        <div class="flex" :class="preference === 1 ? ['flex-col'] : ['flex-col md:flex-row']">
            <div class="mobile-nav">
                <mobile-nav />
            </div>

            <div class="desktop-nav" :data-nav-preference="preference === 1 ? 'horizontal' : 'vertical'">
                <horizontal-nav-bar v-if="preference === 1" />
                <vertical-nav-bar v-if="preference === 0" />
            </div>

            <div class="flex-grow mt-12 md:mt-0" :class="preference === 1 ? ['flex', 'flex-col', 'items-center', 'px-10'] : ['pl-0', 'md:pl-64']">
                <socket-error-notice />

                <div class="mx-4 mt-8 md:mx-8" :class="preference === 1 ? ['md:container'] : []">
                    <div class="flex flex-col lg:flex-row justify-between items-center md:items-start mb-8">
                        <div class="flex">
                            <div class="w-14 h-14 md:w-20 md:h-20 mr-3 flex items-center justify-center header-icon shrink-0">
                                <fa :icon="['fas', currentRoute.icon]" :key="currentRoute.icon" class="text-xl md:text-3xl" />
                            </div>
                            <div class="flex flex-col flex-grow header justify-center">
                                <h1 class="text-white font-light text-header">
                                    <t :path="`navigation.${currentRoute.name}.title`" />
                                </h1>
                                <small class="text-base">
                                    <t :path="`navigation.${currentRoute.name}.description`" />
                                </small>
                            </div>
                        </div>
                        <div class="text-center lg:text-left">
                            <ol class="flex flex-wrap py-3 px-4 md:px-2 list-none">
                                <li class="breadcrumb" v-for="data of breadcrumbPath" :key="data">
                                    <t :path="`navigation.${data}.title`" />
                                </li>
                            </ol>
                        </div>
                    </div>

                    <alerts class="mb-8" />

                    <skeleton-context :when="skeletonContext">
                        <router-view />
                    </skeleton-context>
                </div>

                <v-footer />
            </div>
        </div>
    </template>
</template>

<style lang="scss" scoped>
.breadcrumb {
    @apply text-white;

    &:not(:last-child) {
        @apply mr-3 text-opacity-50;

        &:after {
            @apply ml-3 text-opacity-25;

            content: ">";
        }
    }

    &:last-child {
        @apply text-white text-opacity-75;
    }
}

.header {
    line-height: 1.2 !important;
}

.header-icon {
    color: #1ad4a8;
    background: rgba(26, 212, 168, .2);
    border-radius: 9999px;
}

.text-header {
    font-size: 1.75rem;
}

.mobile-nav {
    display: block;
}

.desktop-nav {
    display: none;
}

@media screen and (min-width: 768px) {
    .mobile-nav {
        display: none;
    }

    .desktop-nav {
        display: block;
    }
}
</style>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { Router, state } from '~/core';
import { NavBarPosition } from '~/api/models/User';
import { Passthrough, TabberPassthrough } from '~/views';
import MobileNav from '~/views/MobileNav.vue';
import HorizontalNavBar from './HorizontalNavBar.vue';
import VerticalNavBar from './VerticalNavBar.vue';
import SocketErrorNotice from '~/views/SocketErrorNotice.vue';
import ServerError from '~/views/errors/ServerError.vue';
import AnnouncementBar from '~/views/AnnouncementBar.vue';

export default defineComponent({
    components: {
        MobileNav,
        ServerError,
        SocketErrorNotice,
        VerticalNavBar,
        HorizontalNavBar,
        AnnouncementBar,
    },
    setup() {
        return {
            alerts: computed(() => state.alerts.items),
            currentRoute: computed(() => state.navigation.currentRoute),
            preference: computed(() => state.user.data?.preferences?.navbarPosition || NavBarPosition.LEFT),
            breadcrumbPath: computed(() => {
                const currentRoute = Router.currentRoute.value;
                const name = currentRoute.name as string;
                const split = name?.split('.');
                if (!split || split.length === 0) return [];

                // TODO: TabberPassthrough should be replaced in the path by the model name
                let filterOut: string[] = [];
                const matched = currentRoute.matched.filter(element => [Passthrough, TabberPassthrough].includes(element.components.default) && !element.meta?.showAsCategory);
                if (matched && matched.length > 0) filterOut = matched.map(a => a.name as string);

                const res = [];
                let prevPath = '';
                for(const path of split) {
                    const str = `${prevPath}${path}`;

                    if (!filterOut.includes(str)) res.push(str);
                    prevPath += `${path}.`;
                }

                return res;
            }),
            skeletonContext: computed(() => Object.keys(state.navigation.currentRoute?.params || {}).map(name => `ModelBindings@${name}`)),
        };
    },
});
</script>
