import state from '~/state';

class Guest implements Middleware {
    name() {
        return 'guest';
    }

    async run() {
        if (!state.user.loggedIn) return;

        return {
            name: 'index',
        };
    }
}

export default new Guest();
