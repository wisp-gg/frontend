import { Parser } from '~/api';
import RequestService from './request';
import { Domain } from '~/api/models';

interface CreateDomainRequest {
    name: string;
}

interface DeleteDomainRequest {
    id: number;
}

class DomainsService {
    getAll(req: PaginatableRequest) {
        return RequestService.get('/domains', {
            sort: 'name',
            include: ['serversCount'],
            ...req,
        })
            .then(Parser.parse);
    }

    get(): Promise<Domain> {
        return RequestService.get('/domains/:domain')
            .then(Parser.parse);
    }

    create(data: CreateDomainRequest): Promise<Domain> {
        return RequestService.post('/domains', data)
            .then(Parser.parse);
    }

    update(data: CreateDomainRequest): Promise<Domain> {
        return RequestService.put('/domains/:domain', data)
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    delete(data: DeleteDomainRequest): Promise<Domain> {
        return RequestService.delete(`/domains/${data.id}`);
    }
}

export default new DomainsService();
