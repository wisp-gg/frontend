import state from '~/state';

class Authenticated implements Middleware {
    name() {
        return 'authenticated';
    }

    async run() {
        if (state.user.loggedIn) return;

        return {
            name: 'login.index',
        };
    }
}

export default new Authenticated();
