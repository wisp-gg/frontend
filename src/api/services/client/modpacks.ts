import { Parser } from '~/api';
import RequestService from './request';

interface GetModpackVersionsRequest {
    modpack: number;
}

interface ModpackVersion {
    id: number;
    name: string;
    label: string | null;
}

interface InstallModpackRequest {
    modpack: number;
    version: number;
    format: boolean;
}

class PluginsService {
    get(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers/:server/modpacks', req)
            .then(Parser.parse);
    }

    versions(data: GetModpackVersionsRequest): Promise<ModpackVersion[]> {
        return RequestService.get(`/servers/:server/modpacks/${data.modpack}`);
    }

    install(data: InstallModpackRequest) {
        return RequestService.post('/servers/:server/modpacks', data);
    }
}

export default new PluginsService();
