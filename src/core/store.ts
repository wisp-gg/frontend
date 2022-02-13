import { createStore, Dispatch } from 'vuex';

const store = createStore<RootState>({
    strict: import.meta.env.DEV,
});

export default store;
export const state = store.state as RootState;
export const getter = <T = any>(name: string) => store.getters[name] as T;
export const dispatch = store.dispatch as Dispatch;
