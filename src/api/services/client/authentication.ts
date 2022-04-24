import { Logger, Router } from '~/core';
import state from '~/state';
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

    required?: 'totp';
    redirect?: string;
}

class AuthenticationService {
    initializeUser() { // TODO: consider data injected from backend
        return RequestService.get('/auth/@me', {
            include: ['notifications', 'announcements'],
        })
            .then(data => {
                Logger.debug('Authentication', 'User is already authenticated!');

                state.user.set(Parser.parse(data));
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
            .finally(() => state.user.markInitialized());
    }

    private async loggedIn(data: LoginState) {
        state.user.set(Parser.parse(data.user!));
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

                if (data.required === 'totp') {
                    return Router.push({
                        name: 'login.totp',
                    });
                }
            });
    }

    totp(data: TotpFormData) {
        return RequestService.post('/auth/login/totp?include[]=notifications&include[]=announcements', data)
            .then(async data => {
                if (data.finished) return this.loggedIn(data);

                if (data.required === 'totp') {
                    return Router.push({
                        name: 'login.totp',
                    });
                }
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
                state.user.set(undefined);

                await Router.push({
                    name: 'login.index',
                });
            });
    }
}

export default new AuthenticationService();
