import { getter } from '~/core';

class Authenticated implements Middleware {
    name() {
        return 'authenticated';
    }

    async run() {
        const loggedIn = getter<boolean>('user/loggedIn');
        if (loggedIn) return;

        return {
            name: 'login.index',
        };
    }
}

export default new Authenticated();
