import Logger from '~/core/logger';
import { Parser } from '~/api';
import { Server } from '~/api/models';
import RequestService from './request';

export enum ServerStatus {
    Loading = 'loading',
    Error = 'error',

    Offline = 'offline',
    Starting = 'starting',
    Running = 'running',
    Stopping = 'stopping',

    Migrating = 'migrating',

    Installing = 'installing',
    FailedInstall = 'failed_install',

    Suspended = 'suspended',
    Updating = 'updating',
    Moving = 'moving',

    CreatingBackup = 'creating_backup',
    DeployingBackup = 'deploying_backup',
}

export const mappedState: {[status: string]: string} = {
    [ServerStatus.Error]: 'danger',

    [ServerStatus.Offline]: 'danger',
    [ServerStatus.Running]: 'success',
    [ServerStatus.Starting]: 'info',
    [ServerStatus.Stopping]: 'info',

    [ServerStatus.Migrating]: 'warning',

    [ServerStatus.Installing]: 'warning',
    [ServerStatus.FailedInstall]: 'danger',

    [ServerStatus.Suspended]: 'warning',
    [ServerStatus.Updating]: 'info',
    [ServerStatus.Moving]: 'info',

    [ServerStatus.CreatingBackup]: 'info',
    [ServerStatus.DeployingBackup]: 'info',
};

// server-proc
export interface ServerProcess {
    cpu_used: number,
    memory_used: number
    disk_used: number,
    network: {
        rx_bytes: number,
        tx_bytes: number
    },
}

// server-query
export interface ServerQuery {
    type: string;
    name: string;
    description: string;
    gamemode: string;
    version: string;
    map: string;
    password: boolean;
    maxplayers: number;
    players: []; // TODO: proper type for me
    bots: []; // TODO: proper type for me

    raw: any;
}

export interface ServerStats {
    status: ServerStatus;
    process?: ServerProcess;
    query?: ServerQuery;
}

interface GetStatsRequest {
    servers: string[];
}

class ServersService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers', {
            ...req,
            include: ['node', 'egg', 'allocations', 'allocations.subdomain'],
        }).then(Parser.parse);
    }

    get(): Promise<Server> {
        return RequestService.get('/servers/:server', {
            include: ['node', 'nest', 'egg', 'allocations', 'features', 'allocations.subdomain'],
        }).then(Parser.parse);
    }

    private stats(data: GetStatsRequest): Promise<{[uuid: string]: ServerStats}> {
        return RequestService.get('/servers/stats', data);
    }

    private queue: {[uuid: string]: (stats: ServerStats) => void} = {};
    private startupTimer: null | ReturnType<typeof setTimeout> = null;
    private fetchTimer: null | ReturnType<typeof setInterval> = null;
    registerStats(serverUuid: string , callback: (stats: ServerStats) => void) {
        Logger.debug('ServersService', `Registering ${serverUuid} for stats...`);
        this.queue[serverUuid] = callback;

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

        const fetchedServer: {[uuid: string]: boolean} = {};

        this.stats({
            servers: Object.keys(this.queue),
        })
            .then(res => {
                for(const uuid in res) {
                    if (!this.queue[uuid]) {
                        Logger.warn('ServersService', `Received stats for ${uuid} even though it wasn't requested...?`);
                        continue;
                    }

                    this.queue[uuid](res[uuid]);
                    fetchedServer[uuid] = true;
                }
            })
            .catch(err => {
                Logger.warn('ServersService', `Failed fetching server stats (${Object.keys(this.queue).join(', ')}): ${err}`);
            })
            .finally(() => {
                // If either the request failed or is missing some specific
                // server for whatever reason, their stats should be set to
                // an equivalent of an error.
                for(const uuid of Object.keys(this.queue)) {
                    if (fetchedServer[uuid] || !this.queue[uuid]) continue;

                    Logger.debug('ServersService', `Missing data for ${uuid}, assuming it's dead.`);
                    this.queue[uuid]({
                        status: ServerStatus.Error,
                    });
                }
            });
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
