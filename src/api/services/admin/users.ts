import RequestService from './request';
import { Parser } from '~/api';
import { User } from '~/api/models';

interface CreateUserRequest {
    email: string;
    name_first: string;
    name_last: string;
    external_id: string;
    password: string;
    root_admin: boolean;
    support_op: boolean;
    support_op_bypass: string;
}

type UpdateUserRequest = CreateUserRequest & {
    use_totp: boolean;
    ignore_connection_error: boolean;
};

interface DeleteUserRequest {
    id: number;
}

class UsersService {
    getAll(req: PaginatableRequest): Promise<User[]> {
        return RequestService.get('/users', {
            ...req,
            include: ['servers_count']
        })
            .then(Parser.parse);
    }

    get(): Promise<User> {
        return RequestService.get('/users/:user')
            .then(Parser.parse);
    }

    create(data: CreateUserRequest): Promise<User> {
        return RequestService.post('/users', data)
            .then(Parser.parse);
    }

    update(data: UpdateUserRequest): Promise<User> {
        return RequestService.put('/users/:user', data)
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    delete(data: DeleteUserRequest): Promise<void> {
        return RequestService.delete(`/users/${data.id}`);
    }
}

export default new UsersService();
