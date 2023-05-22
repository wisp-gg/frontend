import { Parser } from '~/api';
import RequestService from './request';

interface ToggleModRequest {
    id: number;
}

class ModsService {
    get(): Promise<ListResponse> {
        return RequestService.get('/servers/:server/mods')
            .then(Parser.parse);
    }

    toggle(data: ToggleModRequest): Promise<void> {
        return RequestService.post(`/servers/:server/mods/${data.id}`, {
            timeout: 120000,
        });
    }
}

export default new ModsService();
