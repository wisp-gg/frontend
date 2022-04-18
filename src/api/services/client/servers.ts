import Logger from '~/core/logger';
import { Parser } from '~/api';
import { Server } from '~/api/models';
import RequestService from './request';

export enum ServerStatus {
    Error = -1,

    Offline = 0,
    Online = 1,
    Starting = 2,
    Stopping = 3,

    Migrating = 10,

    Installing = 20,
    FailedInstall = 21,

    Suspended = 30,
    Updating = 31,
    Moving = 32,

    CreatingBackup = 40,
    DeployingBackup = 41,
}

export const mappedState: {[status: number]: [string, string]} = {
    [ServerStatus.Error]: ['danger', 'error'],

    [ServerStatus.Offline]: ['danger', 'offline'],
    [ServerStatus.Online]: ['success', 'online'],
    [ServerStatus.Starting]: ['info', 'starting'],
    [ServerStatus.Stopping]: ['info', 'stopping'],

    [ServerStatus.Migrating]: ['warning', 'migrating'],

    [ServerStatus.Installing]: ['warning', 'installing'],
    [ServerStatus.FailedInstall]: ['danger', 'failed_install'],

    [ServerStatus.Suspended]: ['warning', 'suspended'],
    [ServerStatus.Updating]: ['info', 'updating'],
    [ServerStatus.Moving]: ['info', 'moving'],

    [ServerStatus.CreatingBackup]: ['info', 'creating_backup'],
    [ServerStatus.DeployingBackup]: ['info', 'deploying_backup'],
};

export interface ServerStats {
    status: ServerStatus;
    proc?: Record<string, any>; // TODO: Me
    query?: Record<string, any>; // TODO: Me
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
                        status: -1,
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
