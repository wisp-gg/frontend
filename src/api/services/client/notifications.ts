import { Logger, state, dispatch } from '~/core';
import { Parser } from '~/api/parser';
import RequestService from './request';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import Sound from '~/assets/mp3/notification.mp3';

const sound = new Audio(Sound);
class NotificationsService {
    private echo?: Echo;

    initializeNotifications() {
        Logger.debug('NotificationsService', 'Initializing echo...');
        try {
            this.echo = new Echo({
                broadcaster: 'pusher',
                client: new Pusher(state.settings.data?.pusher?.key!, {
                    cluster: state.settings.data?.pusher?.cluster,
                    forceTLS: true,
                    disableStats: true,

                    authorizer: (channel, options) => {
                        return {
                            authorize: (socketId, callback) => {
                                Logger.debug('NotificationsService', `Trying to authorize socket ${socketId} for channel ${channel.name}...`);
                                RequestService.post('/broadcasting/auth', {
                                    socket_id: socketId,
                                    channel_name: channel.name
                                })
                                    .then(response => callback(null, response))
                                    .catch(err => callback(err, { auth: '' }));
                            },
                        };
                    },
                }),
            });

            this.echo.private(`${state.settings.data?.pusher?.namespace}_Notifications_${state.user.data?.id}`)
                .notification((data: any) => {
                    // Trick the parser into converting the notification as it would come from the HTTP API
                    const notification = Parser.parse({
                        object: 'notification',
                        attributes: data,
                        meta: {},
                    });

                    sound.play().catch(() => {});
                    dispatch('user/update', {
                        prepend_relationships: {
                            notifications: notification,
                        },
                    });
                });
        } catch(err) {
            Logger.error('NotificationsService', 'Initialization failed:', err);
        }
    }

    deinitializeNotifications() {
        Logger.debug('NotificationsService', 'Deinitialized echo.');
        this.echo?.disconnect();
    }
}

export default new NotificationsService();
