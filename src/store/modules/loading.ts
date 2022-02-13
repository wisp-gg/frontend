import { Module } from 'vuex';

export interface LoadingStore {
    items: number[];
}

let incr = 0;
const loading: Module<LoadingStore, any> = {
    namespaced: true,
    state: {
        items: []
    },

    mutations: {
        addItem: (state, payload: number) => {
            state.items.push(payload);
        },

        removeItem: (state, payload: number) => {
            state.items.splice(state.items.indexOf(payload), 1);
        },
    },

    actions: {
        add: ({ commit }) => {
            const id = incr++;
            commit('addItem', id);

            return () => commit('removeItem', id);
        },
    },

    getters: {
        isLoading: state => state.items.length > 0,
    }
};

export default loading;
