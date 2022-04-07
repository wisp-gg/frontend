import RequestService from './request';
import { Parser } from '~/api';
import { ServerSubdomain } from '~/api/models';

interface CreateSubdomainRequest {
    name: string;
    domain_id: number;
}

interface DeleteSubdomainRequest {
    id: number;
}

class SubdomainsService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers/:server/subdomains', req).then(Parser.parse);
    }

    create(data: CreateSubdomainRequest): Promise<ServerSubdomain> {
        return RequestService.post('/servers/:server/subdomains', data)
            .then(Parser.parse);
    }

    delete(data: DeleteSubdomainRequest): Promise<void> {
        return RequestService.delete(`/servers/:server/subdomains/${data.id}`);
    }

    domains(): Promise<ListResponse> {
        return RequestService.get('/servers/:server/subdomains/domains')
            .then(Parser.parse);
    }
}

export default new SubdomainsService();
