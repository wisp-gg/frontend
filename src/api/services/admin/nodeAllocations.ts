import RequestService from './request';
import { Allocation } from '~/api/models';
import { Parser } from '~/api';

interface FetchSelectorAllocationsRequest {
    node: number;
    in_use?: boolean;
    ip_port?: string;
}

interface CreateAllocationRequest {
    ip: string[];
    alias?: string;
    ports: string[];
}

interface UpdateAllocationRequest {
    id: number;
    alias: string;
}

interface MassDeleteAllocationsRequest {
    allocations?: number[];
    ips?: string[]
}

interface DeleteAllocationRequest {
    id: number;
}

class NodeAllocationsService {
    getAll(req: PaginatableRequest): Promise<Allocation[]> {
        return RequestService.get('/nodes/:node/allocations', {
            ...req,
            include: 'server'
        })
            .then(Parser.parse);
    }

    getAllForSelector(data: FetchSelectorAllocationsRequest): Promise<Allocation[]> {
        return RequestService.get(`/nodes/${data.node}/allocations`, {
            ['filter[ip_port]']: data.ip_port,
            ['filter[in_use]']: data.in_use
        }).then(Parser.parse);
    }

    ips(): Promise<string[]> {
        return RequestService.get('/nodes/:node/allocations/ips');
    }

    create(data: CreateAllocationRequest): Promise<void> {
        return RequestService.post('/nodes/:node/allocations', data);
    }

    update(data: UpdateAllocationRequest): Promise<Allocation> {
        return RequestService.put(`/nodes/:node/allocations/${data.id}`, data)
            .then(Parser.parse);
    }

    massDelete(data: MassDeleteAllocationsRequest): Promise<void> {
        return RequestService.delete('/nodes/:node/allocations', data);
    }

    delete(data: DeleteAllocationRequest): Promise<void> {
        return RequestService.delete(`/nodes/:node/allocations/${data.id}`);
    }

}

export default new NodeAllocationsService();
