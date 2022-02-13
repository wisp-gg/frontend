import { Module } from 'vuex';
import { ServerStatus, ServerStatistics, GameStatistics } from '~/api/services/daemon';

export interface SocketStore {
    connected: boolean;
    error?: string;
    status?: ServerStatus;
    proc?: ServerStatistics;
    query?: GameStatistics;
}

const socket: Module<SocketStore, any> = {
    namespaced: true,
    state: {
        connected: false,
    },

    mutations: {
        setState: (state, payload: boolean) => {
            state.connected = payload;
            delete state.error;
        },

        setError: (state, error?: string) => {
            state.error = error;
        },

        setStatus: (state, payload: ServerStatus) => {
            state.status = payload;
        },

        setProc: (state, payload?: ServerStatistics) => {
            state.proc = payload;
        },

        setQuery: (state, payload?: GameStatistics) => {
            state.query = payload;
        },
    },

    actions: {
        setState: ({ commit }, payload: boolean) => {
            commit('setState', payload);
        },

        setError: ({ commit }, payload?: string) => {
            commit('setError', payload);
        },

        setStatus: ({ commit }, payload: ServerStatus | undefined) => {
            commit('setStatus', payload);
        },

        setProc: ({ commit }, payload?: ServerStatistics) => {
            commit('setProc', payload);
        },

        setQuery: ({ commit }, payload?: GameStatistics) => {
            commit('setQuery', payload);
        },
    },
};

export default socket;
