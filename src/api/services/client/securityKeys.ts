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
        response: {
            attestation_object: string;
            client_data_json: string;
        }
    }
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
}

export default new SecurityKeysService();
