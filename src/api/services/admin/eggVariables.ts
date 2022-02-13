import { Parser } from '~/api';
import { EggVariable } from '~/api/models';
import RequestService from './request';

interface CreateVariableRequest {
    name: string;
    description: string;
    env_variable: string;
    default_value: string;
    user_viewable: boolean;
    user_editable: boolean;
    tickable: boolean;
}

interface UpdateVariableRequest extends CreateVariableRequest {
    id: number;
}

interface DeleteVariableRequest {
    id: number;
}

class EggVariablesService {
    getAll(req: PaginatableRequest, params: { nest?: number, egg?: number } = {}): Promise<ListResponse> {
        return RequestService.get(`/nests/${params.nest ?? ':nest'}/eggs/${params.egg ?? ':egg'}/variables`, req)
            .then(Parser.parse);
    }

    create(data: CreateVariableRequest): Promise<EggVariable> {
        return RequestService.post('/nests/:nest/eggs/:egg/variables', data)
            .then(Parser.parse);
    }

    update(data: UpdateVariableRequest): Promise<EggVariable> {
        return RequestService.put(`/nests/:nest/eggs/:egg/variables/${data.id}`, data)
            .then(Parser.parse);
    }

    delete(data: DeleteVariableRequest): Promise<void> {
        return RequestService.delete(`/nests/:nest/eggs/:egg/variables/${data.id}`);
    }
}

export default new EggVariablesService();
