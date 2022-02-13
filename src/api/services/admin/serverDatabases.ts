import { Parser } from '~/api';
import RequestService from './request';

interface CreateDatabaseRequest {
    host: number;
    name: string;
    connections_from: string;
}

interface RotateDatabasePasswordRequest {
    id: number;
}

interface DeleteDatabaseRequest {
    id: number;
}

class ServerDatabasesService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers/:server/databases', {
            include: ['host'],
            ...req,
        })
            .then(Parser.parse);
    }

    create(data: CreateDatabaseRequest) {
        return RequestService.post('/servers/:server/databases', {
            database_host_id: data.host,
            database: data.name,
            remote: data.connections_from,
        });
    }

    rotatePassword(data: RotateDatabasePasswordRequest) {
        return RequestService.post(`/servers/:server/databases/${data.id}/rotate-password`)
            .then(Parser.parse);
    }

    delete(data: DeleteDatabaseRequest) {
        return RequestService.delete(`/servers/:server/databases/${data.id}`);
    }
}

export default new ServerDatabasesService();
