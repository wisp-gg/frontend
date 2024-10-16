import { Module } from 'vuex';

export interface Alert {
    id?: string;
    key?: string;
    timeout?: number;
    type: string;
    title: TranslatableMessage;
    icon?: string;
    messages?: TranslatableMessage[];
}

export interface AlertStore {
    items: Alert[];
}

let incr = 0;
const lookup: Record<string, string> = {
    success: 'check-circle',
    danger: 'exclamation-triangle',
};

const alerts: Module<AlertStore, any> = {
    namespaced: true,
    state: {
        items: []
    },

    mutations: {
        addItem: (state, payload: Alert) => {
            state.items.push(payload);
        },

        removeItem: (state, payload: string) => {
            state.items.splice(state.items.findIndex(i => i.id === payload), 1);
        },

        setItems: (state, payload: Alert[]) => {
            state.items = payload;
        }
    },

    actions: {
        add: ({ dispatch, commit }, payload: Alert) => {
            payload.id = (incr++).toString();
            if (!payload.icon && lookup[payload.type]) payload.icon = lookup[payload.type];

            commit('addItem', payload);

            // If the alert only affects a specific item,
            // we don't want to scroll to the top of the page
            if (! payload.key) window.scrollTo(0, 0);

            if (payload.timeout) {
                setTimeout(() => {
                    dispatch('remove', payload.id);
                }, payload.timeout);
            }
        },

        remove: ({ commit }, payload: string) => {
            commit('removeItem', payload);
        },

        clear: ({ commit, state }, payload?: string) => {
            if (payload) {
                commit('setItems', state.items.filter(r => r.key !== payload));
            } else {
                commit('setItems', []);
            }
        }
    },
};

export default alerts;
