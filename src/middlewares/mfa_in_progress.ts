import { state } from '~/core';

class MFAInProgress implements Middleware {
    name() {
        return 'mfa_in_progress';
    }

    async run() {
        if (state.user.mfa) return;

        return {
            name: 'login.index',
        };
    }
}

export default new MFAInProgress();
