import { getter } from '~/core';

class Guest implements Middleware {
    name() {
        return 'guest';
    }

    async run() {
        const loggedIn = getter<boolean>('user/loggedIn');
        if (!loggedIn) return;

        return {
            name: 'index',
        };
    }
}

export default new Guest();
