import { Module } from 'vuex';
import { Feature } from '~/api/models/Features';

export interface Branding {
    name: string;
    logo?: string;
    login_logo?: string;
    favicon?: string;
}

export interface WHMCS {
    enabled: boolean;
    button_text: string;

    // Admin-only
    url?: string;
    client_id?: string;
    client_secret?: string;
    api_id?: string;
    api_secret?: string;
}

export interface OpenGraph {
    site_name?: string;
    title?: string;
    description?: string;
    image?: string;
}

export interface Injector {
    css?: string;
    js?: string;
}

export interface Misc {
    required_2fa?: number;

    // Admin-only
    databases_allow_random?: boolean;
}

export interface Pusher {
    namespace?: string;
    key?: string;
    cluster?: string;
}

export interface Settings {
    default_locale?: string;

    branding?: Branding;
    whmcs?: WHMCS;
    og?: OpenGraph;
    injector?: Injector;
    misc?: Misc;
    pusher?: Pusher;

    // TODO: Optionally instance expiration data?

    features: Record<string, Feature>
}

export interface SettingsStore {
    initialized: boolean;
    data?: Settings;
}

const settings: Module<SettingsStore, any> = {
    namespaced: true,
    state: {
        initialized: false,
        data: undefined,
    },

    mutations: {
        setInitialized: (state, payload: boolean) => {
            state.initialized = payload;
        },

        set: (state, payload?: Settings) => {
            state.data = payload;
        },

        update: (state, payload: Partial<Settings>) => {
            state.data = { ...(state.data as Settings), ... payload };
        },
    },

    actions: {
        markInitialized: ({ commit }) => {
            commit('setInitialized', true);
        },

        set: ({ commit }, payload?: Settings) => {
            commit('set', payload);
        },

        update: ({ commit }, payload: Partial<Settings>) => {
            commit('update', payload);
        },
    },

    getters: {},
};

export default settings;
