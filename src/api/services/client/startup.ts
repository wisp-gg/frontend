import { Parser } from '~/api';
import RequestService from './request';

interface StartupSaveData {
    environment?: Record<string, string>;
}

class StartupService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers/:server/startup', req).then(Parser.parse);
    }

    async save(data: StartupSaveData): Promise<ListResponse> {
        return RequestService.put('/servers/:server/startup', data)
            .then(Parser.parse);
    }
}

export default new StartupService();
