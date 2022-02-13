import { Parser } from '~/api';
import RequestService from './request';

interface UpdateAllocation {
    id: number;

    primary: boolean;
}

class AllocationsService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers/:server/allocations', req).then(Parser.parse);
    }

    update(data: UpdateAllocation): Promise<void> {
        return RequestService.patch(`/servers/:server/allocations/${data.id}`, {
            primary: data.primary
        });
    }
}

export default new AllocationsService();
