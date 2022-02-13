import { RouteLocationNormalized } from 'vue-router';
import { state, dispatch } from '~/core';

class TOTP implements Middleware {
    private except = ['account.security'];

    name() {
        return 'totp';
    }

    async run(to: RouteLocationNormalized) {
        if (!state.user.data) return;

        const required = state.settings.data?.misc?.required_2fa || 0;
        if (required > 0 && !state.user.data?.useTotp) {
            if (this.except.includes((to.name || '').toString())) return;

            dispatch('alerts/add', {
                type: 'danger',
                title: ['client.account.2fa_must_be_enabled'],
            });

            return {
                name: 'account.security',
            };
        }
    }
}

export default new TOTP();
