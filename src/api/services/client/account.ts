import { Parser } from '~/api';
import state from '~/state';
import RequestService from './request';

interface AccountUpdateFormData {
    action: string;

    // confirmation for email/password
    current_password?: string;

    // email
    email?: string;

    // password
    new_password?: string;
    new_password_confirmation?: string;

    // identity
    name_first?: string;
    name_last?: string;
    preferences?: Record<string, string>;

    // sso
    sso_redirect?: string;
    sso_code?: string;
    sso_state?: string;
}

class AccountService {
    getCredentials(data: PaginatableRequest):  Promise<ListResponse> {
        return RequestService.get('/security/credentials', data)
            .then(Parser.parse);
    }

    update(data: AccountUpdateFormData) {
        return RequestService.put('/account', data)
            .then(res => {
                state.user.update(data);

                return res;
            });
    }

    markNotificationsRead() {
        return RequestService.post('/account/notifications');
    }

    markAnnouncementsRead() {
        return RequestService.post('/account/announcements');
    }
}

export default new AccountService();
