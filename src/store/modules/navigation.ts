import { Module } from 'vuex';

export interface RouteData {
    name: string;
    displayName: string;
    active: boolean;

    // Specific route
    params?: Record<any, any>;
    permission?: string;
    feature?: string;

    // Dropdown route
    routes?: RouteData[];
}

type CurrentRouteData = RouteData & { icon: string; };

export interface NavigationStore {
    routes: RouteData[];
    currentRoute: CurrentRouteData;
}

const navigation: Module<NavigationStore, any> = {
    namespaced: true,
    state: {
        routes: [],
        currentRoute: {
            name: 'unknown',
            displayName: 'unknown',
            icon: 'unknown',
            active: false,
        },
    },

    mutations: {
        setRoutes: (state, payload: RouteData[]) => {
            state.routes = payload;
        },

        setCurrentRoute: (state, payload: CurrentRouteData) => {
            state.currentRoute = payload;
        },
    },

    actions: {
        setRoutes: ({ commit }, payload: RouteData[]) => {
            commit('setRoutes', payload);
        },

        setCurrentRoute: ({ commit }, payload: CurrentRouteData) => {
            commit('setCurrentRoute', payload);
        },
    },
};

export default navigation;
