import { defineStore } from 'pinia';

export interface Alert {
    id?: string;
    key?: string;
    timeout?: number;
    type: string;
    title: TranslatableMessage;
    icon?: string;
    messages?: TranslatableMessage[];
}

export interface AlertsState {
    items: Alert[];
}

let incr = 0;
const lookup: Record<string, string> = {
    success: 'check-circle',
    danger: 'exclamation-triangle',
};

export default defineStore('alerts', {
    state: () => (<AlertsState>{
        items: [],
    }),

    actions: {
        add(payload: Alert) {
            payload.id = (incr++).toString();
            if (!payload.icon && lookup[payload.type]) payload.icon = lookup[payload.type];

            this.items.push(payload);

            window.scrollTo(0, 0);

            if (payload.timeout) {
                setTimeout(() => {
                    this.remove(payload.id!);
                }, payload.timeout);
            }
        },

        remove(payload: string) {
            this.items.splice(this.items.findIndex(i => i.id === payload), 1);
        },

        clear(payload?: string) {
            if (payload) {
                this.items = this.items.filter(r => r.key !== payload);
            } else {
                this.items = [];
            }
        }
    },
});
