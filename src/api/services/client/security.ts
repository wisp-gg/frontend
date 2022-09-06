import { dispatch } from '~/core';
import { Parser } from '~/api';
import { ApiKey, User } from '~/api/models';
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

    enable2Fa(data: Toggle2FaData): Promise<User> {
        return RequestService.put('/security/totp', data)
            .then(Parser.parse)
            .then((res: User) => {
                dispatch('user/update', {
                    has2fa: res.has2fa,
                    mfaMethods: [...res.mfaMethods, 'totp'],
                });

                return res;
            });
    }

    disable2Fa(data: Toggle2FaData): Promise<User> {
        return RequestService.delete('/security/totp', { data })
            .then(Parser.parse)
            .then((res: User) => {
                console.log(res);

                dispatch('user/update', {
                    has2fa: res.has2fa,
                    mfaMethods: res.mfaMethods.filter(x => x !== 'totp')
                });

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
