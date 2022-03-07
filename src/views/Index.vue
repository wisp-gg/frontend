<template>
    <list service-id="servers@getAll" :per-page="12" searchable>
        <template #results="{ results }">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-6" v-if="results.length > 0">
                <server-card v-for="(result, idx) of results" :key="idx" :server="result" />
            </div>
            <div v-else class="flex flex-col lg:flex-row justify-center items-center my-8">
                <img class="w-2/3 lg:w-1/3" :src="notFound" />

                <div class="text-center gap-y-8 mt-4 lg:mt-0 lg:ml-4 lg:text-left">
                    <h1 class="text-2xl text-white/75">
                        <t path="generic.server.no_servers" />
                    </h1>

                    <p>
                        <t path="generic.server.no_servers_description" />
                    </p>
                </div>
            </div>
        </template>
    </list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import ServerCard from './ServerCard.vue';
import notFound from '~/assets/svg/undraw/not_found.svg';

export default defineComponent({
    components: {
        ServerCard,
    },
    setup() {
        const { t } = useI18n();

        return {
            t,
            notFound,
        };
    },
});
</script>
