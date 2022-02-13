import { dispatch } from '~/core';
import { Parser } from '~/api';
import { ApiKey } from '~/api/models';
import RequestService from './request';

export interface Generate2FaData {
    email: string;
    issuer: string;
    secret: string;
}

interface Toggle2FaData {
    token: string;
}

class SecurityService {
    get2Fa(): Promise<Generate2FaData> {
        return RequestService.get('/security/totp');
    }

    enable2Fa(data: Toggle2FaData) {
        return RequestService.put('/security/totp', data)
            .then(res => {
                dispatch('user/update', { useTotp: true });

                return res;
            });
    }

    disable2Fa(data: Toggle2FaData) {
        return RequestService.delete('/security/totp', data)
            .then(res => {
                dispatch('user/update', { useTotp: false });

                return res;
            });
    }

    createCredential(data: { memo: string, allowed_ips?: string }): Promise<ApiKey> {
        return RequestService.post('/security/credentials', data)
            .then(Parser.parse);
    }

    deleteCredential(data: { identifier: string }) {
        return RequestService.delete(`/security/credentials/${data.identifier}`);
    }
}

export default new SecurityService();
