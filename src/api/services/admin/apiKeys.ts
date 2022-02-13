import { Parser } from '~/api';
import { ApiKey } from '~/api/models';
import RequestService from './request';

type ResourceString = `r_${string}`;
interface CreateApiKeyRequest {
    [key: ResourceString]: number;
    memo: string;
}

interface UpdateApplicationApiRequest {
    // TODO: Me
}

interface DeleteApplicationApiRequest {
    id: string;
}

class ApiKeysService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/application-api', {
            ...req,
            include: ['user'],
        })
            .then(Parser.parse);
    }

    get(): Promise<ApiKey> {
        return RequestService.get('/application-api/:apiKey')
            .then(Parser.parse);
    }

    create(data: CreateApiKeyRequest): Promise<ApiKey> {
        return RequestService.post('/application-api', data)
            .then(Parser.parse);
    }

    update(data: UpdateApplicationApiRequest): Promise<ApiKey> {
        return RequestService.put('/application-api/:apiKey', data)
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    delete(data: DeleteApplicationApiRequest): Promise<void> {
        return RequestService.delete(`/application-api/${data.id}`);
    }
}

export default new ApiKeysService();
