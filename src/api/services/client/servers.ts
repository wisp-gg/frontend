import Logger from '~/core/logger';
import { Parser } from '~/api';
import { Server } from '~/api/models';
import { ServerStats } from './node';
import RequestService from './request';
import NodeService from './node';

class ServersService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers', {
            ...req,
            include: ['node', 'egg', 'allocations'],
        }).then(Parser.parse);
    }

    get(): Promise<Server> {
        return RequestService.get('/servers/:server', {
            include: ['node', 'nest', 'egg', 'allocations', 'features'],
        }).then(Parser.parse);
    }

    private queue: {[uuid: string]: {nodeId: number, callback: (stats: ServerStats) => void}} = {};
    private startupTimer: null | ReturnType<typeof setTimeout> = null;
    private fetchTimer: null | ReturnType<typeof setInterval> = null;
    registerStats(serverUuid: string, nodeId: number, callback: (stats: ServerStats) => void) {
        Logger.debug('ServersService', `Registering ${serverUuid} for stats...`);
        this.queue[serverUuid] = {
            nodeId,
            callback,
        };

        // Due to how this logic is handled inside ServerCard, we could have
        // multiple server cards register itself in a short period of time.
        //
        // To avoid overcomplicating things, we will have a 10ms window for all items
        // to register itself before we start fetching.
        if (!this.fetchTimer) {
            if (this.startupTimer) {
                clearTimeout(this.startupTimer);
                this.startupTimer = null;
            }

            this.startupTimer = setTimeout(() => {
                this.fetchStats();
                this.fetchTimer = setInterval(this.fetchStats.bind(this), 15000);
            }, 10);
        }
    }

    fetchStats() {
        Logger.debug('ServersService', 'Fetching all server stats...');

        const nodes: {[nodeId: string]: string[]} = {};
        for(const serverUuid in this.queue) {
            const data = this.queue[serverUuid];

            nodes[data.nodeId] = nodes[data.nodeId] || [];
            nodes[data.nodeId].push(serverUuid);
        }

        const fetchedServer: {[uuid: string]: boolean} = {};
        for(const nodeId in nodes) {
            NodeService.getStats(nodeId, nodes[nodeId])
                .then(res => {
                    for(const uuid in res) {
                        if (!this.queue[uuid]) {
                            Logger.warn('ServersService', `Received stats for ${uuid} even though it wasn't requested...?`);
                            continue;
                        }

                        this.queue[uuid].callback(res[uuid]);
                        fetchedServer[uuid] = true;
                    }
                })
                .catch(err => {
                    Logger.warn('ServersService', `Failed fetching server stats for node ${nodeId} (${nodes[nodeId].join(', ')}): ${err}`);
                })
                .finally(() => {
                    // If either the request failed or is missing some specific
                    // server for whatever reason, their stats should be set to
                    // an equivalent of an error.
                    for(const uuid of nodes[nodeId]) {
                        if (fetchedServer[uuid] || !this.queue[uuid]) continue;

                        Logger.debug('ServersService', `Missing data for ${uuid}, assuming it's dead.`);
                        this.queue[uuid].callback({
                            status: -1,
                        });
                    }
                });
        }
    }

    unregisterStats(serverUuid: string) {
        Logger.debug('ServersService', `Unregistering ${serverUuid} from stats...`);
        delete this.queue[serverUuid];

        if (Object.keys(this.queue).length < 1) {
            if (this.startupTimer) {
                clearTimeout(this.startupTimer);
                this.startupTimer = null;
            }

            if (this.fetchTimer) {
                clearInterval(this.fetchTimer);
                this.fetchTimer = null;
            }
        }
    }
}

export default new ServersService();
