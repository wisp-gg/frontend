import { Parser } from '~/api';
import RequestService from './request';
import { SecurityKey } from '~/api/models';

export interface RegisterResponse {
    token_id: string;
    credentials: any;
}

interface CreateSecurityKeyRequest {
    name: string;
    token_id: string;
    registration: {
        id: string;
        type: string;
        rawId: string;
        response: {
            attestationObject: string;
            clientDataJSON: string;
        }
    }
}

interface DeleteSecurityKeyRequest {
    id: number;
}

class SecurityKeysService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/security/security-keys', req).then(Parser.parse);
    }

    register(): Promise<RegisterResponse> {
        return RequestService.get('/security/security-keys/register');
    }

    create(data: CreateSecurityKeyRequest): Promise<SecurityKey> {
        return RequestService.post('/security/security-keys/register', data).then(Parser.parse);
    }

    delete(data: DeleteSecurityKeyRequest): Promise<void> {
        return RequestService.delete(`/security/security-keys/${data.id}`);
    }
}

export default new SecurityKeysService();
