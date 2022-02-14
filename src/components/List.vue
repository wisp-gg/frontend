<template>
    <div class="w-full block overflow-x-auto">
        <slot name="layout" :results="list?.results" :pagination="list?.pagination" :search="search" :set-page="setPage">
            <slot v-if="searchable" name="search" :submit="search">
                <div class="flex mb-4">
                    <!-- TODO: Spinner to appear on right side signifying it is currently searching -->
                    <input class="input w-full flex-grow" name="search" :placeholder="t('generic.search')" @keyup="search">

                    <slot name="search-extra" />
                </div>
            </slot>

            <slot name="results" :results="list?.results" :meta="list?.meta" :update="update">
                <table :key="list?.results" class="w-full block xl:table">
                    <tbody>
                        <tr class="w-full bg-primary-400 hidden xl:table-row">
                            <slot name="headers-before" />

                            <th class="px-6 py-3" v-if="checkbox">
                                <div class="flex items-center justify-start">
                                    <input class="input w-auto" type="checkbox" ref="checkboxAll" @click="onCheckboxAllClick">

                                    <slot name="header-checkbox" />
                                </div>
                            </th>

                            <th v-for="field in fields" :key="field.key" class="px-6 py-3 text-left uppercase">
                                <t :path="`components.table.labels.${field.label ?? field.key}`" />
                            </th>

                            <slot name="headers-after" />
                        </tr>

                        <slot v-if="!list?.results.length" name="items-before">
                            <tr class="bg-primary-500 block xl:table-row">
                                <!-- colspan="20" will clamp to the amount of headers - since we cant nicely know the amount of headers
                                    This is the best option as there most likely isnt a case where there will be over 20 headers.
                                    Without this it'd only span a % of the width of the table.
                                    -->
                                <td colspan="20" class="py-32 text-center text-2xl text-white text-opacity-75">
                                    <t path="generic.no_items" />
                                </td>
                            </tr>
                        </slot>
                        <template v-else>
                            <slot name="items-before" :update="update" />

                            <tr v-for="(result, idx) in list?.results" :key="idx" class="bg-primary-500 border-b border-primary-400 block xl:table-row xl:border-none last:border-none" @click="onCheckboxRowClick($event, result)">
                                <slot name="fields-before" :result="result" :update="update" />

                                <td class="px-6 pt-3 xl:py-6 text-center td-min" v-if="checkbox">
                                    <div class="flex items-center">
                                        <skeleton :content="2">
                                            <input class="input w-auto" type="checkbox" :ref="elem => registerCheckboxItem(elem, result)" @click="onCheckboxClick($el)">

                                            <slot name="field-checkbox" :result="result" />
                                        </skeleton>
                                    </div>
                                </td>

                                <td class="block xl:hidden">
                                    <div class="flex flex-row flex-wrap">
                                        <div v-for="(field, fieldIdx) in fields" :key="fieldIdx" class="w-full px-6 py-3 text-left sm:w-1/2" :style="field.style">
                                            <h5 class="text-white/75 font-semibold uppercase">
                                                <skeleton :content="12">
                                                    <t :path="`components.table.labels.${field.label ?? field.key}`" />
                                                </skeleton>
                                            </h5>

                                            <skeleton :content="field.skeleton ?? field.key.length">
                                                <slot :name="`field-${field.key}`" :result="result" :update="update">
                                                    <list-result :field="field" :value="result ? field.key.split('.').reduce((previous, current) => previous[current], result) : null ?? field.default" />
                                                </slot>
                                            </skeleton>
                                        </div>
                                    </div>
                                </td>

                                <td v-for="(field, fieldIdx) in fields" :key="fieldIdx" class="p-6 text-left hidden xl:table-cell" :style="field.style">
                                    <skeleton :content="field.skeleton ?? field.key.length">
                                        <slot :name="`field-${field.key}`" :result="result" :update="update">
                                            <list-result :field="field" :value="result ? field.key.split('.').reduce((previous, current) => previous[current], result) : null ?? field.default" />
                                        </slot>
                                    </skeleton>
                                </td>

                                <slot name="fields-after" :result="result" :update="update" />
                            </tr>

                            <slot name="items-after" :update="update" />
                        </template>
                    </tbody>
                </table>
            </slot>

            <slot name="pagination">
                <div class="flex justify-center" :class="list?.results.length ? ['mt-4'] : []" v-if="list?.pagination">
                    <paginator :pagination-data="list?.pagination" :set-page="setPage" />
                </div>
            </slot>
        </slot>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onBeforeMount, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import debounce from 'debounce';
import { Logger, state, dispatch } from '~/core';
import { useService } from '~/plugins';
import ListResult from './ListResult.vue';

export default defineComponent({
    components: { ListResult },

    props: {
        serviceId: {
            type: [String, Array],
            required: true,
        },
        data: {
            type: [String, Number, Array, Object],
        },
        perPage: {
            type: Number,
            default: 25,
        },
        skeletons: {
            type: Number,
        },
        fields: {
            type: Array,
            validator: (fields: ListField[]) => fields.every(field =>
                !!field.key
            )
        },
        checkbox: {
            type: Boolean,
        },
        searchable: {
            type: Boolean,
        },
    },
    emits: ['results', 'meta', 'pagination', 'checked'], // update setAttribute if you touch this

    // TODO: Ability to filter
    setup(props, { emit }) {
        const { t } = useI18n();
        const serviceId = typeof props.serviceId === 'object' ? (Math.random() * 1e10).toString() : props.serviceId;
        const skeletons = props.skeletons || props.perPage;

        const checkboxAll = ref<HTMLInputElement | null>(null);
        let checkboxes: { checkbox: HTMLInputElement; data: any; }[] = [];

        watch(() => props.data, newValue => {
            if (!newValue) return;

            update();
        });

        watch(() => props.serviceId, newValue => {
            if (!newValue) return;

            update();
        });

        onBeforeMount(async () => {
            await dispatch('lists/add', serviceId);
            await setAttribute('refresh', update);
        });

        onBeforeUnmount(async () => {
            await dispatch('lists/delete', serviceId);
        });

        const setAttribute = (key: string, value: any) => {
            dispatch('lists/set', {
                serviceId,
                key,
                value,
            });

            if (['results', 'meta', 'pagination', 'checked'].includes(key)) {
                emit(key as any, value); // Thank you, TypeScript
            }
        };
        const getAttribute = (key: string) => state.lists.data[serviceId]?.[key];

        const update = async () => {
            Logger.debug('List', `Updating list contents from ${props.serviceId}...`);

            const finished = await dispatch('loading/add');
            await setAttribute('results', new Array(skeletons).fill(null));

            checkboxes = [];
            updateCheckboxState();

            const paginatableRequest: PaginatableRequest = {
                page: getAttribute('page'),
                search: getAttribute('search'),
                perPage: props.perPage,
            };

            if (typeof props.serviceId === 'object') {
                await setAttribute('results', props.serviceId);
                emit('results', props.serviceId);

                finished();
            } else {
                useService<ListResponse>(props.serviceId, true, paginatableRequest, props.data)
                    .then(res => {
                        setAttribute('results', res.data);
                        setAttribute('meta', res.meta);

                        if (res.meta?.pagination) setAttribute('pagination', res.meta.pagination);
                    })
                    .catch(() => {
                        setAttribute('results', []);
                        setAttribute('meta', {});
                    })
                    .finally(() => {
                        finished();
                    });
            }
        };
        update();

        const updateCheckboxState = () => {
            if (checkboxAll.value && checkboxes.length > 0) {
                checkboxAll.value.checked = checkboxes.every(data => data.checkbox.checked);
            }

            return setAttribute(
                'checked',
                checkboxes
                    .filter(data => data.checkbox.checked)
                    .map(data => data.data)
            );
        };

        return {
            t,

            list: computed(() => state.lists.data[serviceId]),
            update,

            search: debounce(async (evt: KeyboardEvent) => {
                const value = (<HTMLInputElement> evt.target).value;
                if (state.lists.data[serviceId]?.search === value) return; // Stops re-search when hitting cmd/ctrl for example

                if (value) {
                    await setAttribute('page', 1);
                    await setAttribute('search', value);
                } else {
                    await setAttribute('search', undefined);
                }

                return update();
            }, 250),

            setPage: async (value: number) => {
                await setAttribute('page', value);

                return update();
            },

            checkboxAll,
            onCheckboxAllClick: () => {
                if (!checkboxAll.value) return;

                checkboxes.forEach(data => {
                    data.checkbox.checked = checkboxAll.value!.checked;
                });

                updateCheckboxState();
            },
            registerCheckboxItem: (el?: HTMLInputElement, item?: any) => {
                if (!el) return;

                // For some reason, ticking a checkbox will always reregister it so make sure we don't have duplicates.
                if (checkboxes.find(checkbox => checkbox.checkbox === el)) return;

                checkboxes.push({
                    checkbox: el,
                    data: item,
                });
            },

            onCheckboxClick: updateCheckboxState,
            onCheckboxRowClick: ({ target }: { target: HTMLInputElement }, result: any) => {
                if (target.tagName === 'TD') {
                    const item = checkboxes.find(r => r.data === result);
                    if (!item) return; // Shrug, guess you'll have to click the box directly instead

                    item.checkbox.checked = !item.checkbox.checked;
                    updateCheckboxState();
                }
            },
        };
    }
});
</script>
