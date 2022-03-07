import { Parser } from '~/api';
import RequestService from './request';
import { Allocation } from '~/api/models';

interface UpdateAllocation {
    id: number;

    primary: boolean;
}

class AllocationsService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers/:server/allocations', req).then(Parser.parse);
    }

    update(data: UpdateAllocation): Promise<Allocation> {
        return RequestService.patch(`/servers/:server/allocations/${data.id}`, {
            primary: data.primary
        })
            .then(Parser.parse);
    }
}

export default new AllocationsService();
