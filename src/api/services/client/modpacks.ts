import { Parser } from '~/api';
import RequestService from './request';

interface InstallModpackRequest {
    modpack_id: string;
    version_id: string;
    format: boolean;
}

class PluginsService {
    get(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers/:server/modpacks', req)
            .then(Parser.parse);
    }

    install(data: InstallModpackRequest) {
        return RequestService.post('/servers/:server/modpacks', data, {
            timeout: 20000,
        });
    }
}

export default new PluginsService();
