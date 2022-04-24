import { defineStore } from 'pinia';
import { BaseModel, Server, Location, Node, DatabaseHost, Mod, Nest, Egg, User, ApiKey, Schedule } from '~/api/models';

export interface SetModelData {
    name: keyof ModelsState;
    model: any;
    refresh: () => any;
}

export interface UpdateModelData {
    name: keyof ModelsState;
    model: Partial<any>,
}

export interface ModelsState {
    [key: string]: any;

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
}

export default defineStore('models', {
    state: () => (<ModelsState>{}),

    actions: {
        set(payload: SetModelData) {
            if (!this._refreshFuncs) this._refreshFuncs = {};

            console.log(payload);

            this[payload.name] = payload.model;
            this._refreshFuncs[payload.name] = payload.refresh;
        },

        update(payload: UpdateModelData) {
            const model = this[payload.name] as BaseModel;

            model?.update(payload.model);
        },

        refresh(name: keyof ModelsState) {
            const refreshFunc = this._refreshFuncs[name];

            if (typeof refreshFunc === 'function') refreshFunc().then((res: BaseModel) => {
                this.set({
                    name: name,
                    model: res,
                    refresh: refreshFunc,
                });
            });
        },

        clear(name: keyof ModelsState) {
            delete this[name];
            delete this._refreshFuncs?.[name];
        },
    },
});

