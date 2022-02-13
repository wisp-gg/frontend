import { Parser } from '~/api';
import RequestService from './request';
import { Mod } from '~/api/models';

interface ToggleModRequest {
    id: number;
}

class ModsService {
    get(): Promise<ListResponse> {
        return RequestService.get('/servers/:server/mods')
            .then(Parser.parse);
    }

    toggle(data: ToggleModRequest): Promise<Mod> {
        return RequestService.post(`/servers/:server/mods/${data.id}`);
    }
}

export default new ModsService();
