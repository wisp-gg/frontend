import { Module } from 'vuex';
import {
    BaseModel,
    Server,
    Location,
    Node,
    DatabaseHost,
    Mod,
    Nest,
    Egg,
    User,
    ApiKey,
    Schedule,
    Domain
} from '~/api/models';

interface SetModelData {
    name: keyof ModelsStore;
    model: any;
    refresh: () => any;
}

interface UpdateModelData {
    name: keyof ModelsStore;
    model: Partial<any>,
}

export interface ModelsStore {
    [key: string]: any,
    _refreshFuncs: Record<string, () => any>;

    databaseHost?: DatabaseHost,
    server?: Server,
    location?: Location,
    node?: Node,
    mod?: Mod,
    nest?: Nest
    egg?: Egg,
    user?: User,
    apiKey?: ApiKey,
    schedule?: Schedule,
    domain?: Domain,
}
const models: Module<ModelsStore, any> = {
    namespaced: true,

    // @ts-expect-error
    state: {},

    mutations: {
        set: (state, payload: SetModelData) => {
            if (!state._refreshFuncs) state._refreshFuncs = {};

            state[payload.name] = payload.model;
            state._refreshFuncs[payload.name] = payload.refresh;
        },

        update: (state, payload: UpdateModelData) => {
            const model = state[payload.name] as BaseModel;

            model?.update(payload.model);
        },

        clear: (state, name: keyof ModelsStore) => {
            delete state[name];
            delete state._refreshFuncs?.[name];
        },
    },

    actions: {
        set: ({ commit }, payload: SetModelData) => {
            commit('set', payload);
        },

        update: ({ commit }, payload: UpdateModelData) => {
            commit('update', payload);
        },

        refresh({ state, commit }, name: keyof ModelsStore) {
            const refreshFunc = state._refreshFuncs[name];

            if (typeof refreshFunc === 'function') refreshFunc().then((res: BaseModel) => {
                commit('set', {
                    name: name,
                    model: res,
                    refresh: refreshFunc,
                });
            });
        },

        clear: ({ commit }, name: keyof ModelsStore) => {
            commit('clear', name);
        },
    },
};

export default models;
