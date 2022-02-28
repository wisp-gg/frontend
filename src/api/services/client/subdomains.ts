import { Parser } from '~/api';
import RequestService from './request';

class SubdomainsService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers/:server/subdomains', req)
            .then(Parser.parse);
    }
}

export default new SubdomainsService();
