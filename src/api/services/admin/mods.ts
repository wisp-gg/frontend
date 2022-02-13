import { Parser } from '~/api';
import RequestService from './request';
import { Mod } from '~/api/models';

interface CreateModRequest {
    name: string;
    description: string;
    version: string;
    category: string;
    scriptInstall: string;
    scriptUninstall: string;
}

interface DeleteModRequest {
    id: number;
}

class ModsService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/mods', {
            sort: 'category',
            ...req,
        })
            .then(Parser.parse);
    }

    get(): Promise<Mod> {
        return RequestService.get('/mods/:mod', {
            include: 'egg',
        })
            .then(Parser.parse);
    }

    create(data: CreateModRequest): Promise<Mod> {
        return RequestService.post('/mods', data)
            .then(Parser.parse);
    }

    update(data: CreateModRequest): Promise<Mod> {
        return RequestService.put('/mods/:mod', data)
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    delete(data: DeleteModRequest): Promise<void> {
        return RequestService.delete(`/mods/${data.id}`);
    }
}

export default new ModsService();
