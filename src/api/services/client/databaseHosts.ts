import { Parser } from '~/api';
import RequestService from './request';

class DatabaseHostsService {
    get(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.getCached('database-hosts-:server', '/servers/:server/databases/hosts', req)
            .then(Parser.parse);
    }
}

export default new DatabaseHostsService();
