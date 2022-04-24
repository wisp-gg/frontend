import { defineStore } from 'pinia';

export interface RouteData {
    name: string;
    displayName?: string;
    active?: boolean;

    // Specific route
    params?: Record<any, any>;
    permission?: string;
    feature?: string;

    // Dropdown route
    routes?: RouteData[];
}

type CurrentRouteData = RouteData & { icon: string; };

export interface NavigationState {
    routes: RouteData[];
    currentRoute: CurrentRouteData;
}

export default defineStore('navigation', {
    state: () => (<NavigationState>{
        routes: [],
        currentRoute: {
            name: 'unknown',
            displayName: 'unknown',
            icon: 'unknown',
            active: false,
        },
    }),

    actions: {
        setRoutes(payload: RouteData[]) {
            this.routes = payload;
        },

        setCurrentRoute(payload: CurrentRouteData) {
            this.currentRoute = payload;
        },
    },
});
