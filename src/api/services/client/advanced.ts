import { Parser } from '~/api';
import { Server } from '~/api/models';
import RequestService from './request';

interface UpdateData {
    beta: boolean;
}

export enum VersionType {
    Unknown,
    Snapshot,
    Release,
}

export enum VersionLabel {
    Unknown,
    Recommended,
    Latest,
}

export interface Version {
    id: string;
    name: string;
    type: VersionType;
    label: VersionLabel;
}

export interface CategorizedVersions {
    category: string;
    versions: Version[];
}

export type Edition = Version[] | CategorizedVersions[];

export interface MinecraftData {
    metadata: {
        show_labels_for: string[],
        skip_categories_for: string[],
    },
    versions: Record<string, Edition>,
}

interface InstallEditionData {
    edition: string;
    version: string;
    format: boolean;
}

class AdvancedService {
    toggleSupport() {
        return RequestService.post('/servers/:server/advanced/support')
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    toggleMonitor(): Promise<Server> {
        return RequestService.post('/servers/:server/advanced/monitor')
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    // TODO: the following actions should also update server state?
    update(data: UpdateData): Promise<Server> {
        return RequestService.post('/servers/:server/advanced/update', data);
    }

    fetchVersions(): Promise<MinecraftData> {
        return RequestService.get('/servers/:server/advanced/versions');
    }

    installVersion(data: InstallEditionData): Promise<void> {
        return RequestService.post('/servers/:server/advanced/version', data);
    }

    reinstall(): Promise<void> {
        return RequestService.post('/servers/:server/advanced/reinstall');
    }
}

export default new AdvancedService();
