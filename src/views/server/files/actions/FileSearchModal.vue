<template>
    <modal :title="title" @update:modelValue="onModalChange">
        <template #opener="{ open }">
            <v-button @click="open" color="secondary" :permission="['file.list', 'file.read']" class="flex items-center p-4 text-sm w-full rounded-b-none">
                <fa class="mr-2" :icon="['fas', 'search']" size="lg" fixed-width />
                <t path="server.files.search" />
            </v-button>
        </template>

        <template #default>
            <stepper :steps="2">
                <template #step-1="{ next }">
                    <v-form :service-id="(data) => search(data, next)" class="flex-grow">
                        <v-input name="query" rule="required" hide-label />

                        <div class="text-right">
                            <v-submit color="primary" label="generic.submit" :permission="['file.list', 'file.read']" />
                        </div>
                    </v-form>
                </template>

                <template #step-2>
                    <div v-if="results">
                        <div class="pb-2" v-if="Object.values(results.files).length === 0">
                            <t path="generic.no_results_found" />
                        </div>
                        <div class="pb-2" v-else-if="results.tooMany">
                            <t path="server.files.too_many_results" />
                        </div>

                        <accordion class="mb-2" :name="['_raw', name]" v-for="(data, name) of results.files" :key="name">
                            <template #extra>
                                <span class="label bg-primary-100 text-white mr-2">
                                    <t :path="['generic.results', data.results]" />
                                </span>
                            </template>

                            <editor-preview class="mb-2" :lines="block.lines" :highlight="query" :line-start="block.start" v-for="(block, index) of computeCodeBlocks(data.lines)" :key="index" />
                        </accordion>
                    </div>
                    <t path="generic.something_went_wrong" v-else />
                </template>
            </stepper>
        </template>
    </modal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useDaemonEvent, triggerDaemonAction } from '~/plugins';
import { SearchResults } from '~/api/services/daemon/types';
import EditorPreview from '~/components/EditorPreview.vue';

export default defineComponent({
    components: { EditorPreview },
    setup(props, context) {
        const title = ref<string | TranslatableMessage>('server.files.search');
        const query = ref('');
        const results = ref<SearchResults | undefined>();

        return {
            title,
            results,
            query,
            onModalChange: () => title.value = 'server.files.search',
            search: (searchData: { query: string }, next: () => void): Promise<void> => {
                query.value = searchData.query;

                return new Promise(resolve => {
                    const unregisterResults = useDaemonEvent('search-results', data => {
                        results.value = data;
                        title.value = ['server.files.search_results', searchData];

                        finish();
                    });
                    const unregisterError = useDaemonEvent('search-error', () => finish());
                    const finish = () => {
                        unregisterResults();
                        unregisterError();

                        resolve();
                        next();
                    };

                    triggerDaemonAction('search', searchData.query);
                });
            },

            computeCodeBlocks: (lines: Record<number, string>) => {
                const blocks: { lines: string[], start: number }[] = [];

                let start;
                for(const lineNumber in lines) {
                    const actualLineNumber = Number(lineNumber);

                    if (!start) {
                        start = actualLineNumber;
                        blocks.push({
                            lines: [],
                            start,
                        });
                    }

                    blocks[blocks.length - 1].lines.push(lines[actualLineNumber]);

                    if (lines[actualLineNumber + 1] === undefined) start = undefined;
                }

                return blocks;
            },
        };
    },
});
</script>
