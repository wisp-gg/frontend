<template>
    <list service-id="servers@getAll" :per-page="6">
        <template #layout="list">
            <div class="darker-input">
                <input class="input w-full mb-8" name="search" :placeholder="t('generic.search')" @keyup="list.search">
            </div>

            <div class="flex flex-wrap flex-col lg:flex-row gap-y-6" v-if="list.results.length > 0">
                <server-card v-for="(result, idx) of list.results" :key="idx" :server="result" />
            </div>
            <div v-else>
                <!-- TODO: better looking no items text :v -->
                <t path="generic.no_items" />
            </div>

            <div class="flex justify-center">
                <paginator :pagination-data="list.pagination" :set-page="list.setPage" />
            </div>
        </template>
    </list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import ServerCard from './ServerCard.vue';

export default defineComponent({
    components: {
        ServerCard,
    },
    setup() {
        const { t } = useI18n();

        return {
            t,
        };
    },
});
</script>
