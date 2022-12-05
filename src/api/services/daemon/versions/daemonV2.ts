import Sockette from 'sockette';
import { dispatch, Logger } from '~/core';
import { ServerStatus, TransformedDaemonEvent } from '../types';
import { BaseWebsocket, WebSocketConnectData } from './BaseWebsocket';

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
                Logger.warn('DaemonWrapper', 'WebSocket received an error', err);
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

        // const connectionFailedHandler = (message: string) => {
        //     Logger.warn('DaemonWrapper', `WebSocket connection failed: ${message}`);
        //
        //     switch(message.toLowerCase()) { // Convert any errors we don't control to translated format
        //         case 'websocket error':
        //         case 'timeout':
        //             message = 'errors.socket.trouble_connecting';
        //             break;
        //         case 'invalid namespace':
        //             message = 'errors.socket.invalid_namespace';
        //             break;
        //     }
        //
        //     dispatch('server/socket/setError', message);
        // };

        // this.socket.on('connect_error', err => connectionFailedHandler(err.message));
        // this.socket.on('auth_failed', data => connectionFailedHandler(data.message));

        this.on('auth_success', () => {
            Logger.info('DaemonWrapper', 'WebSocket connected and successfully authenticated');

            dispatch('server/socket/setState', true);
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
}
