import { RouteLocationNormalized } from 'vue-router';
import state from '~/state';

class TOTP implements Middleware {
    static LEVEL_NONE = 0;
    static LEVEL_ADMIN = 1;
    static LEVEL_ALL = 2;

    private except = ['account.security'];

    name() {
        return 'totp';
    }

    async run(to: RouteLocationNormalized) {
        if (!state.user.data) return;

        const required = state.settings.data?.misc?.required_2fa || 0;
        if (required > 0 && !state.user.data?.useTotp) {
            if (required === TOTP.LEVEL_ADMIN) {
                const user = state.user.data;
                if (!user?.rootAdmin && !user?.supportOp) return;
            }

            if (this.except.includes((to.name || '').toString())) return;

            state.alerts.add({
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
