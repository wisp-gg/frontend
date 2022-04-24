import { defineStore } from 'pinia';
import { ServerStatus, ServerStatistics, GameStatistics } from '~/api/services/daemon';

export interface ServerState {
    connected: boolean;
    error?: string;
    status?: ServerStatus;
    proc?: ServerStatistics;
    query?: GameStatistics;
}

export default defineStore('server', {
    state: () => (<ServerState>{
        connected: false,
    }),

    actions: {
        setState(payload: boolean) {
            if (payload) delete this.error;
            this.connected = payload;
        },

        setError(payload?: string) {
            this.error = payload;
        },

        setStatus(payload: ServerStatus | undefined) {
            this.status = payload;
        },

        setProc(payload?: ServerStatistics) {
            this.proc = payload;
        },

        setQuery(payload?: GameStatistics) {
            this.query = payload;
        },
    },
});
