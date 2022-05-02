import { Module } from 'vuex';
import Logger from '~/core/logger';
import { User } from '~/api/models';

interface MFAData {
    methods: MFAMethods[];
    webauthn?: {
        public_key: PublicKeyCredentialRequestOptions;
    }
}

export interface UserStore {
    initialized: boolean;
    mfa?: MFAData;
    data?: User;
}

const user: Module<UserStore, any> = {
    namespaced: true,
    state: {
        initialized: false,
        mfa: undefined,
        data: undefined,
    },

    mutations: {
        setInitialized: (state, payload: boolean) => {
            state.initialized = payload;
        },

        setMfa: (state, payload?: MFAData) => {
            state.mfa = payload;
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

        setMfa: ({ commit }, payload?: MFAData) => {
            commit('setMfa', payload);
        },

        set: ({ commit }, payload?: User) => {
            if (payload) Logger.debug('User', `Authenticated as ${payload.email}.`);
            else Logger.debug('User', 'Logged out.');

            commit('setMfa', undefined);
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
