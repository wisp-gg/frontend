import { Parser } from '~/api';
import RequestService from './request';
import { Server } from '~/api/models';

interface ToggleBackupRequest {
    id: number;
}

class ServerBackupService {
    getAll(): Promise<ListResponse> {
        return RequestService.get('/servers/:server/backups', {
            'filter[creating]': true,
        }).then(Parser.parse);
    }

    toggle(data: ToggleBackupRequest): Promise<Server> {
        return RequestService.post(`/servers/:server/backups/${data.id}/toggle`, data)
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }
}

export default new ServerBackupService();
