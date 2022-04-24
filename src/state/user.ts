import { defineStore } from 'pinia';
import Logger from '~/core/logger';
import { User } from '~/api/models';

export interface UserState {
    initialized: boolean;
    data?: User;
}

export default defineStore('user', {
    state: () => (<UserState>{
        initialized: false,
        data: undefined,
    }),

    actions: {
        markInitialized() {
            this.initialized = true;
        },

        set(payload?: User) {
            if (payload) Logger.debug('User', `Authenticated as ${payload.email}.`);
            else Logger.debug('User', 'Logged out.');

            this.data = payload;
        },

        update(payload: Record<string, any>) {
            this.data?.update(payload);
        },
    },

    getters: {
        loggedIn: state => !!state.data,
    },
});
