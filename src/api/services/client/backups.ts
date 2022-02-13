import { Parser } from '~/api';
import { Backup } from '~/api/models';
import RequestService from './request';

interface CreateBackupRequest {
    name: string;
}

export interface DownloadBackupRequest {
    url: string;
}

class BackupsService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers/:server/backups', req)
            .then(Parser.parse);
    }

    create(data: CreateBackupRequest): Promise<Backup> {
        return RequestService.post('/servers/:server/backups', data)
            .then(Parser.parse);
    }

    toggleLocked(data: Backup): Promise<Backup> {
        return RequestService.post(`/servers/:server/backups/${data.uuidShort}/locked`)
            .then(Parser.parse);
    }

    // TODO: the following actions should also update server state?
    deploy(data: Backup) {
        return RequestService.post(`/servers/:server/backups/${data.uuidShort}/deploy`);
    }

    download(data: Backup) {
        return RequestService.get(`/servers/:server/backups/${data.uuidShort}/download`);
    }

    delete(data: Backup) {
        return RequestService.delete(`/servers/:server/backups/${data.uuidShort}`);
    }
}

export default new BackupsService();
