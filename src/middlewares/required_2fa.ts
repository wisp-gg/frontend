import { RouteLocationNormalized } from 'vue-router';
import { state, dispatch } from '~/core';

class Required2FA implements Middleware {
    static LEVEL_NONE = 0;
    static LEVEL_ADMIN = 1;
    static LEVEL_ALL = 2;

    private except = ['account.settings.2fa'];

    name() {
        return 'required_2fa';
    }

    async run(to: RouteLocationNormalized) {
        if (!state.user.data) return;

        const required = state.settings.data?.misc?.required_2fa || 0;
        if (required > 0 && !state.user.data?.has2FAEnabled()) {
            if (required === Required2FA.LEVEL_ADMIN) {
                const user = state.user.data;
                if (!user?.rootAdmin && !user?.supportOp) return;
            }

            if (this.except.includes((to.name || '').toString())) return;

            dispatch('alerts/add', {
                type: 'danger',
                title: ['client.account.2fa_must_be_enabled'],
            });

            return {
                name: 'account.settings.2fa',
            };
        }
    }
}

export default new Required2FA();
