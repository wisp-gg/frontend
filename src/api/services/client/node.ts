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

class NodeService {
    getStats(nodeId: string | number, servers: string[]): Promise<{[uuid: string]: ServerStats}> {
        return RequestService
            .get(`/nodes/${nodeId}/stats`, {
                servers
            });
    }
}

export default new NodeService();
