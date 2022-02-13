import { RouteLocationNormalized } from 'vue-router';
import { state } from '~/core';

class Admin implements Middleware {
    name() {
        return 'admin';
    }

    async run(to: RouteLocationNormalized) {
        if (!state.user.data?.rootAdmin) {
            // TODO: this should be a 403 instead
            return {
                name: '404',
                params: {
                    catchAll: to.path.split('/').slice(1).join('/'),
                },
                query: to.query,
                hash: to.hash,
            };
        }
    }
}

export default new Admin();
