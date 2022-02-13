<template>
    <div class="bg-primary-500 rounded mb-4">
        <ul class="flex">
            <v-button
                v-for="(tab, idx) of tabs"
                :key="idx"
                :to="{ name: tab.name, params: tab.params }"

                class="first:border-l-0 border-l border-primary-400 px-4 py-3"
                :class="tab.active ? ['text-white', 'border-t-2 border-t-accent-200/75'] : []"

                :permission="tab.permission"
                span-class="flex"
            >
                <li>
                    <t :path="`navigation.${tab.name}.title`" />
                </li>
            </v-button>
        </ul>
    </div>

    <router-view />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import { getRouteParams } from '~/helpers';
import { hasFeatures } from '~/plugins';

export default defineComponent({
    name: 'TabberPassthrough', // Don't remove otherwise components.default.name isnt set

    setup() {
        const route = useRoute();
        const currentRoute = computed(() => route.matched.find(a => a.components.default.name === 'TabberPassthrough'));

        return {
            tabs: computed(() =>
                currentRoute.value!.children
                    .filter(r => r.meta?.feature ? hasFeatures(r.meta?.feature) : true)
                    .map(r => ({
                        name: r.name,
                        params: getRouteParams(`${currentRoute.value!.path}/${r.path}`, route.params),
                        active: r.name === route.name,
                        permission: r.meta?.permission,
                    }))
            ),
        };
    },
});
</script>
