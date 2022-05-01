import { Logger, Router, dispatch } from '~/core';
import { RequestError } from '~/errors';
import { Parser } from '~/api';
import RequestService from './request';
import SettingsService from './settings';
import NotificationsService from './notifications';

interface LoginFormData {
    method: string;

    email?: string;
    password?: string;

    sso_redirect?: string;
    state?: string;
    code?: string;
}

interface TotpFormData {
    token: string;
}

interface KeyLoginData {
    id: string;
    type: string;
    rawId: string;
    response: {
        authenticatorData: string;
        clientDataJSON: string;
        signature: string;
        userHandle?: string;
    }
}

interface ResetPasswordFormData {
    email: string;
}

interface ResetPasswordTokenFormData {
    email: string;
    password: string;
    password_confirmation: string;
}


export interface LoginState {
    finished?: boolean;
    user?: ModelResponse,

    required?: MFAMethods[];
    redirect?: string;
}

class AuthenticationService {
    initializeUser() { // TODO: consider data injected from backend
        return RequestService.get('/auth/@me', {
            include: ['notifications', 'announcements'],
        })
            .then(data => {
                Logger.debug('Authentication', 'User is already authenticated!');

                dispatch('user/set', Parser.parse(data));
            })
            .catch(err => {
                if (err instanceof RequestError) {
                    // Ignore if we aren't authenticated.
                    if (err.getStatusCode() === 401) {
                        Logger.debug('Authentication', 'User is not authenticated.');
                        return;
                    }
                }

                throw err;
            })
            .finally(() => dispatch('user/markInitialized'));
    }

    private async loggedIn(data: LoginState) {
        await dispatch('user/set', Parser.parse(data.user!));
        await SettingsService.initializeSettings();

        // Background service
        NotificationsService.initializeNotifications();

        return Router.push({
            name: 'index',
        });
    }

    login(data: LoginFormData) {
        return RequestService.post('/auth/login?include[]=notifications&include[]=announcements', data)
            .then(async data => {
                if (data.finished) return this.loggedIn(data);

                if (data.redirect) {
                    window.location.href = data.redirect;
                    return;
                }

                if (data.required?.length) {
                    await dispatch('user/setMfa', {
                        methods: data.required,
                        webauthn: data.webauthn,
                    });

                    if (data.required?.includes('webauthn')) {
                        return Router.push({
                            name: 'login.key',
                        });
                    } else if (data.required?.includes('totp')) {
                        return Router.push({
                            name: 'login.2fa',
                        });
                    }
                }
            });
    }

    totp(data: TotpFormData) {
        return RequestService.post('/auth/login/totp?include[]=notifications&include[]=announcements', data)
            .then(async data => {
                if (data.finished) return this.loggedIn(data);
            });
    }

    key(data: KeyLoginData) {
        return RequestService.post('/auth/login/key?include[]=notifications&include[]=announcements', data)
            .then(async data => {
                if (data.finished) return this.loggedIn(data);
            });
    }

    resetPassword(data: ResetPasswordFormData) {
        return RequestService.post('/auth/forgot/request', data);
    }

    resetPasswordToken(data: ResetPasswordTokenFormData) {
        return RequestService.post('/auth/forgot/reset/:token', data)
            .then(() => {
                return Router.push({
                    name: 'login.index',
                });
            });
    }

    logout() {
        return RequestService.post('/auth/logout')
            .then(async () => {
                NotificationsService.deinitializeNotifications();

                // TODO: race condition - this should be unset only after redirect finishes (though guest middleware will fail if this is after push :/)
                await dispatch('user/set', undefined);

                await Router.push({
                    name: 'login.index',
                });
            });
    }
}

export default new AuthenticationService();
