import { Module } from 'vuex';
import Logger from '~/core/logger';

export interface LoadingStore {
    items: Record<string, string[]>;
}

// The context id is in format of `service;metadata-key:metadata-value,...`
function getPrefix(id: string) {
    return id.split(';')[0];
}

let incr = 0;
const loading: Module<LoadingStore, any> = {
    namespaced: true,
    state: {
        items: {},
    },

    mutations: {
        addItem: (state, id: string) => {
            Logger.debug('LoadingState', `Added ${id}`);

            const prefix = getPrefix(id);
            state.items[prefix] = state.items[prefix] || [];
            state.items[prefix].push(id);
        },

        removeItem: (state, id: string) => {
            Logger.debug('LoadingState', `Removed ${id}`);

            const prefix = getPrefix(id);
            if (!state.items[prefix]) return;

            const index = state.items[prefix].indexOf(id);
            if (index === -1) return;

            state.items[prefix].splice(index, 1);
            if (state.items[prefix].length === 0) delete state.items[prefix];
        },
    },

    actions: {
        add: ({ commit }, name?: string) => {
            const id = name || (incr++).toString();
            commit('addItem', id);

            return () => commit('removeItem', id);
        },
    },

    getters: {
        isLoading: state => (id?: string) => {
            if (!id) return Object.keys(state.items).length > 0;

            const prefix = getPrefix(id);
            if (!state.items[prefix]) return false;

            return prefix === id ?? (state.items[prefix].indexOf(id) !== -1);
        },
    }
};

export default loading;
