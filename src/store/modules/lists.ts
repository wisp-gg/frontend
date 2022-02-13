import { Module } from 'vuex';
import { BaseModel } from '~/api/models';

export interface List<T extends BaseModel> {
    [key: string]: any;
    page: number,
    search: string | undefined,
    results: T[],
    meta: Record<string, any>,
    pagination: PaginationResponse,
    checked: T[],
    refresh: () => Promise<void>,
}

export interface ListsStore {
    data: Record<string, List<any>>
}

interface SetListAttribute {
    serviceId: string;
    key: any;
    value: any;
}

const lists: Module<ListsStore, any> = {
    namespaced: true,
    state: {
        data: {},
    },

    mutations: {
        add: (state, serviceId: string) => {
            if (serviceId in state.data) {
                // This in theory can happen when some page explicitly doesn't use namespaces for service, and they end up conflicting
                throw new Error(`Service ID ${serviceId} already has a list???`);
            }

            state.data[serviceId] = {
                page: 1,
                search: undefined,
                results: [],
                meta: {},
                pagination: {
                    count: 0,
                    currentPage: 1,
                    total: 0,
                    totalPages: 1,
                    perPage: 10,
                },
                checked: [],
                refresh: async () => {
                    throw new Error('Refresh handler for list failed to register???');
                },
            };
        },

        set: (state, data: SetListAttribute) => {
            const list = state.data[data.serviceId];
            if (!list) return;

            list[data.key] = data.value;
        },

        refresh: (state, serviceId: string) => {
            state.data[serviceId]?.refresh();
        },

        delete: (state, serviceId: string) => {
            delete state.data[serviceId];
        },
    },

    actions: {
        add: ({ commit }, serviceId: string) => {
            commit('add', serviceId);
        },

        set: ({ commit }, data: SetListAttribute) => {
            commit('set', data);
        },

        refresh: ({ commit }, serviceId: string) => {
            commit('refresh', serviceId);
        },

        delete: ({ commit }, serviceId: string) => {
            commit('delete', serviceId);
        },
    },
};

export default lists;
