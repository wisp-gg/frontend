import { Parser } from '~/api';
import RequestService from './request';

interface InstallPluginRequest {
    plugin_id: number;
}

class PluginsService {
    get(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers/:server/plugins', req)
            .then(Parser.parse);
    }

    install(data: InstallPluginRequest) {
        return RequestService.post('/servers/:server/plugins', data);
    }
}

export default new PluginsService();
