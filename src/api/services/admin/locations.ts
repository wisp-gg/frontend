import { Parser } from '~/api';
import { Location } from '~/api/models';
import RequestService from './request';

interface CreateLocationRequest {
    short: string;
    long: string;
}

type UpdateLocationRequest = CreateLocationRequest

interface DeleteLocationRequest {
    id: number;
}

class LocationsService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/locations', {
            ...req,
            include: ['nodes_count', 'servers_count']
        }).then(Parser.parse);
    }

    get(): Promise<Location> {
        return RequestService.get('/locations/:location', {
            include: 'nodes'
        })
            .then(Parser.parse);
    }

    create(data: CreateLocationRequest): Promise<Location> {
        return RequestService.post('/locations', data)
            .then(Parser.parse);
    }

    update(data: UpdateLocationRequest): Promise<Location> {
        return RequestService.put('/locations/:location', data)
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    delete(data: DeleteLocationRequest): Promise<void> {
        return RequestService.delete(`/locations/${data.id}`);
    }
}

export default new LocationsService();
