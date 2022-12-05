import Sockette from 'sockette';
import { dispatch, Logger } from '~/core';
import { ServerService } from '~/api/services/client';
import { ServerStatus, TransformedDaemonEvent } from '../types';
import { BaseWebsocket, WebSocketConnectData } from './BaseWebsocket';

const reconnectErrors = ['jwt: exp claim is invalid', 'jwt: created too far in past (denylist)'];

export class DaemonV2 extends BaseWebsocket {
    private socket?: Sockette;
    private events: Record<string, ((...args: any[]) => any)[]> = {};
    private anyEvents: ((...args: any[]) => any)[] = [];

    constructor() {
        super();

        const onStatusUpdate: TransformedDaemonEvent = (statusStr: string) => {
            let status = ServerStatus.OFF;

            switch(statusStr) {
                case 'offline':
                    status = ServerStatus.OFF;
                    break;
                case 'starting':
                    status = ServerStatus.STARTING;
                    break;
                case 'running':
                    status = ServerStatus.ON;
                    break;
                case 'stopping':
                    status = ServerStatus.STOPPING;
                    break;
            }

            return ['server-status', status];
        };

        this.transformers = {
            events: {
                'connected': () => ['connected'],
                'status': onStatusUpdate,
            },

            actions: {
                'request-logs': () => ['send logs'],
            },
        };
    }

    async connect(data: WebSocketConnectData) {
        this.socket = new Sockette(data.url, {
            onopen: () => {
                Logger.debug('DaemonWrapper', `WebSocket connected, attempting to authenticate with token ${data.token.substring(0, 10)}(truncated)`);
                this.emit('auth', data.token);
            },

            onreconnect: () => {
                Logger.debug('DaemonWrapper', `WebSocket reconnected, attempting to authenticate with token ${data.token.substring(0, 10)}(truncated)`);
                this.emit('auth', data.token);
            },

            onclose: () => {
                Logger.info('DaemonWrapper', 'WebSocket disconnected');
                dispatch('server/socket/setState', false);
            },

            onerror: err => {
                Logger.warn('DaemonWrapper', 'WebSocket connection failed');
                dispatch('server/socket/setError', 'errors.socket.trouble_connecting');
            },

            onmessage: evt => {
                try {
                    const { event, args } = JSON.parse(evt.data);

                    this.events[event]?.forEach(cb => args ? cb(...args) : cb());
                    this.anyEvents.forEach(cb => args ? cb(event, ...args) : cb(event));
                } catch (err) {
                    Logger.warn('DaemonWrapper', 'Failed to parse incoming websocket message.', err);
                }
            }
        });

        this.on('auth_success', () => {
            Logger.info('DaemonWrapper', 'WebSocket connected and successfully authenticated');

            dispatch('server/socket/setState', true);
        });

        this.on('token expiring', () => this.refreshToken());
        this.on('token expired', () => this.refreshToken());
        this.on('jwt error', (error: string) => {
            dispatch('server/socket/setState', true);
            Logger.warn('DaemonWrapper', `JWT validation error from daemon: ${error}`);

            if (reconnectErrors.find(v => error.toLowerCase().indexOf(v) >= 0)) {
                this.refreshToken();
            } else {
                dispatch('server/socket/setError', 'errors.socket.couldnt_validate_credentials');
            }
        });
    }

    async disconnect() {
        this.socket?.close();
        delete this.socket;

        this.events = {};
        this.anyEvents = [];
    }

    on(event: string, cb: (...args: any[]) => any) {
        if (!this.events[event]) this.events[event] = [];

        this.events[event].push(cb);
    }

    onAny(cb: (...args: any[]) => any) {
        this.anyEvents.push(cb);
    }

    emit(event: string, ...args: any[]) {
        this.socket?.send(JSON.stringify({
            event,
            args: args
        }));
    }

    async refreshToken() {
        const data = await ServerService.getWebsocket();
        this.emit('auth', data.token);
    }
}
