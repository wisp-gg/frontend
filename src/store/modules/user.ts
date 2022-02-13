import { Module } from 'vuex';
import Logger from '~/core/logger';
import { User } from '~/api/models';

export interface UserStore {
    initialized: boolean;
    data?: User;
}

const user: Module<UserStore, any> = {
    namespaced: true,
    state: {
        initialized: false,
        data: undefined,
    },

    mutations: {
        setInitialized: (state, payload: boolean) => {
            state.initialized = payload;
        },

        set: (state, payload?: User) => {
            state.data = payload;
        },

        update: (state, payload: Record<string, any>) => {
            state.data?.update(payload);
        },
    },

    actions: {
        markInitialized: ({ commit }) => {
            commit('setInitialized', true);
        },

        set: ({ commit }, payload?: User) => {
            if (payload) Logger.debug('User', `Authenticated as ${payload.email}.`);
            else Logger.debug('User', 'Logged out.');

            commit('set', payload);
        },

        update: ({ commit }, payload: Record<string, any>) => {
            commit('update', payload);
        },
    },

    getters: {
        loggedIn: state => !!state.data,
    },
};

export default user;
