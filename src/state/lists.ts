import { defineStore } from 'pinia';
import { BaseModel } from '~/api/models';

export interface List<T extends BaseModel = any> {
    [key: string]: any;
    page: number,
    search: string | undefined,
    results: T[],
    meta: Record<string, any>,
    pagination: PaginationResponse,
    checked: T[],
    refresh: () => Promise<void>,
}

export interface SetListAttribute {
    serviceId: string;
    key: any;
    value: any;
}

export interface ListsState {
    data: Record<string, List>;
}

export default defineStore('lists', {
    state: () => (<ListsState>{
        data: {},
    }),

    actions: {
        add(serviceId: string) {
            if (serviceId in this.data) {
                // This in theory can happen when some page explicitly doesn't use namespaces for service, and they end up conflicting
                throw new Error(`Service ID ${serviceId} already has a list???`);
            }

            this.data[serviceId] = {
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

        set(data: SetListAttribute) {
            const list = this.data[data.serviceId];
            if (!list) return;

            list[data.key] = data.value;
        },

        refresh(serviceId: string) {
            this.data[serviceId]?.refresh();
        },

        delete(serviceId: string) {
            delete this.data[serviceId];
        },
    },
});
