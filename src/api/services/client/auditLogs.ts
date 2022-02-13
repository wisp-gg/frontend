import { Parser } from '~/api';
import { AuditLog } from '~/api/models';
import RequestService from './request';

class AuditLogsService {
    get(req: PaginatableRequest): Promise<AuditLog[]> {
        return RequestService.get('/servers/:server/audit-logs', {
            ...req,
            include: 'user',
        })
            .then(Parser.parse);
    }
}

export default new AuditLogsService();
