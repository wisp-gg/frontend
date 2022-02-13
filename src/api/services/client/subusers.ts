import { Parser } from '~/api';
import RequestService from './request';

interface CreateSubuserData {
    email: string;
    permissions: string[];
}

interface UpdateSubuserData {
    id: number;
    email: string;
    permissions: string[];
}

interface GetSubuserData {
    id: number;
}

interface DeleteSubuserData {
    id: number;
}

export interface ServerPermissions {
    permissions: string[];
    assignable: string[];
}

class SubusersService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers/:server/subusers', {
            include: 'user',
            ...req
        })
            .then(Parser.parse);
    }

    get(data: GetSubuserData) {
        return RequestService.get(`/servers/:server/subusers/${data.id}`, {
            include: 'user'
        })
            .then(Parser.parse);
    }

    create(data: CreateSubuserData) {
        return RequestService.post('/servers/:server/subusers', data)
            .then(Parser.parse);
    }

    update(data: UpdateSubuserData) {
        return RequestService.patch(`/servers/:server/subusers/${data.id}`, data)
            .then(Parser.parse);
    }

    delete(data: DeleteSubuserData): Promise<void> {
        return RequestService.delete(`/servers/:server/subusers/${data.id}`);
    }

    permissions(): Promise<ServerPermissions> {
        return RequestService.getCached('subuser-permissions-:server', '/servers/:server/subusers/permissions');
    }
}

export default new SubusersService();
