import { RouteLocationNormalized } from 'vue-router';
import { state } from '~/core';

class Admin implements Middleware {
    name() {
        return 'admin';
    }

    async run(to: RouteLocationNormalized) {
        if (!state.user.data?.rootAdmin && !state.user.data?.supportOp) {
            // TODO: this should be a 403 instead
            return {
                name: '404',
                params: {
                    catchAll: location.pathname.substring(1),
                },
                query: to.query,
                hash: to.hash,
            };
        }
    }
}

export default new Admin();
