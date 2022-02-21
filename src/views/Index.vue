<template>
    <list service-id="servers@getAll" :per-page="12" searchable>
        <template #results="{ results }">
            <div class="grid grid-cols-1 2xl:grid-cols-2 gap-x-4 gap-y-6" v-if="results.length > 0">
                <server-card v-for="(result, idx) of results" :key="idx" :server="result" />
            </div>
            <div v-else>
                <!-- TODO: better looking no items text :v -->
                <t path="generic.no_items" />
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
