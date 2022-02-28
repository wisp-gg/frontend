import RequestService from './request';
import { Parser } from '~/api';
import { ServerSubdomain } from '~/api/models';

interface CreateSubdomainRequest {
    name: string;
    domain_id: number;
}

class SubdomainsService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers/:server/subdomains', {
            ...req,
            include: ['domain']
        }).then(Parser.parse);
    }

    create(data: CreateSubdomainRequest): Promise<ServerSubdomain> {
        return RequestService.post('/servers/:server/subdomains', data)
            .then(Parser.parse);
    }


    domains(): Promise<ListResponse> {
        return RequestService.get('/servers/:server/subdomains/domains')
            .then(Parser.parse);
    }
}

export default new SubdomainsService();
