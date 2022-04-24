import { defineStore } from 'pinia';

export interface LoadingState {
    items: number[];
}

let incr = 0;
export default defineStore('loading', {
    state: () => (<LoadingState>{
        items: [],
    }),

    actions: {
        add() {
            const id = incr++;
            this.items.push(id);

            return () => this.items.splice(this.items.indexOf(id), 1);
        },
    },

    getters: {
        isLoading: state => state.items.length > 0,
    }
});
