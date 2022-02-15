import { Parser } from '~/api';
import RequestService from './request';
import { Nest } from '~/api/models';

interface CreateNestRequest {
    name: string;
    identifier: string;
    description: string;
}

class NestsService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.getCached('nests', '/nests', {
            include: ['eggsCount', 'serversCount', 'eggs'],
            ...req,
        }).then(Parser.parse);
    }

    getAllForSelector(req: PaginatableRequest): Promise<ListResponse> {
        // TODO: Move this back to getCached when we have time to investigate why results disappear upon searching a cached term
        return RequestService.get('/nests', {
            include: ['eggsCount', 'serversCount', 'eggs'],
            ...req,
        }).then(Parser.parse);
    }

    get(): Promise<Nest> {
        return RequestService.get('/nests/:nest')
            .then(Parser.parse);
    }

    create(data: CreateNestRequest): Promise<Nest> {
        return RequestService.post('/nests', data)
            .then(Parser.parse);
    }

    update(data: CreateNestRequest): Promise<Nest> {
        return RequestService.put('/nests/:nest', data)
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    delete(): Promise<void> {
        return RequestService.delete('/nests/:nest');
    }
}

export default new NestsService();
