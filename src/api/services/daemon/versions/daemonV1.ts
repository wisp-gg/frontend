import { io, Socket } from 'socket.io-client';
// @ts-ignore
import SocketIOFileUpload from 'socketio-file-upload/client';
import { dispatch, Logger } from '~/core';
import { ServerStatus, TransformedDaemonEvent } from '../types';
import { BaseWebsocket, WebSocketConnectData } from './BaseWebsocket';

export class DaemonV1 extends BaseWebsocket {
    private socket?: Socket;
    private uploadSocket?: Socket;
    public siofu?: SocketIOFileUpload;

    constructor() {
        super();

        const onConsoleMessage: TransformedDaemonEvent = (data: Record<string, any>) => {
            return ['console-output', data];
        };

        const onStatusUpdate: TransformedDaemonEvent = (data: Record<string, number>) => {
            const { status } = data;

            let realStatus = ServerStatus.OFF;
            switch(status) {
                case 0:
                    realStatus = ServerStatus.OFF;
                    break;
                case 1:
                    realStatus = ServerStatus.ON;
                    break;
                case 2:
                    realStatus = ServerStatus.STARTING;
                    break;
                case 3:
                    realStatus = ServerStatus.STOPPING;
                    break;
            }

            return ['server-status', realStatus];
        };


        this.transformers = {
            events: {
                'connected': () => ['connected'],
                'console': onConsoleMessage,
                'server log': onConsoleMessage,
                'initial status': onStatusUpdate,
                'status': onStatusUpdate,
                'proc': data => {
                    const networkStats: any = Object.values(data.network || {}).shift();

                    return ['server-proc', {
                        cpuUsed: data.cpu.total,
                        memoryUsed: data.memory.total,
                        diskUsed: data.disk.used,
                        network: {
                            rxBytes: networkStats?.rx_bytes || 0,
                            txBytes: networkStats?.tx_bytes || 0
                        },
                    }];
                },
                'query': data => ['server-query', data],
                'upload-logs': data => ['upload-logs', data],
                'filesearch-results': data => ['search-results', data],
                'filesearch-error': data => ['search-error', data],
                'git-success': data => ['git-success', data],
                'git-error': data => ['git-error', data],
                'workshop-dl-new': () => ['workshop-dl-new'],
                'workshop-dl-status': data => ['workshop-dl-status', data],
                'workshop-dl-finish': data => ['workshop-dl-finish', data],
                'backdoorscanner-found': data => ['backdoor-scanner-found', data],
                'backdoorscanner-finished': () => ['backdoor-scanner-finish'],
            },

            actions: {
                'send-power': data => ['set status', data],
                'send-command': data => ['send command', data],
                'request-logs': () => ['send server log'],
                'upload-logs': () => ['upload-logs'],
                'search': data => ['filesearch-start', data],
                'git-clone': data => ['git-clone', data],
                'git-pull': data => ['git-pull', data],
                'workshop-dl-get-status': () => ['workshop-dl-cache-or-new'],
                'workshop-dl-download': data => ['workshop-dl', data],
                'backdoor-scanner-start': () => ['backdoorscanner-start'],
            },
        };
    }

    async connect(data: WebSocketConnectData) {
        this.socket = io(data.url, {
            transports: ['websocket'],
        });

        const connectionFailedHandler = (message: string) => {
            Logger.warn('DaemonWrapper', `WebSocket connection failed: ${message}`);

            switch(message.toLowerCase()) { // Convert any errors we don't control to translated format
                case 'websocket error':
                case 'timeout':
                    message = 'errors.socket.trouble_connecting';
                    break;
                case 'invalid namespace':
                    message = 'errors.socket.invalid_namespace';
                    break;
            }

            dispatch('server/socket/setError', message);
        };

        this.socket.on('error', err => Logger.warn('DaemonWrapper', `WebSocket received an error: ${err}`));
        this.socket.on('connect_error', err => connectionFailedHandler(err.message));
        this.socket.on('auth_failed', data => connectionFailedHandler(data.message));

        this.socket.on('connect', () => {
            Logger.debug('DaemonWrapper', `WebSocket connected, attempting to authenticate with token ${data.token.substring(0, 10)}(truncated)`);

            this.socket!.emit('auth', data.token);
        });

        this.socket.on('auth_success', () => {
            Logger.info('DaemonWrapper', 'WebSocket connected and successfully authenticated');

            dispatch('server/socket/setState', true);
            this.emit('connected');
        });

        this.socket.on('disconnect', () => {
            Logger.info('DaemonWrapper', 'WebSocket disconnected');

            dispatch('server/socket/setState', false);
        });

        // Setup the upload socket - if something goes really wrong here, it isn't critical so this is mostly here as a "best effort"
        if (data.upload_url) {
            const uploadConnectionFailedHandler = (message: string) => {
                Logger.warn('DaemonWrapper', `Upload WebSocket connection failed: ${message}`);
            };

            this.uploadSocket = io(data.upload_url, {
                transports: ['websocket'],
            });

            this.uploadSocket.on('connect', () => {
                Logger.info('DaemonWrapper', `Upload WebSocket connected, attempting to authenticate with token ${data.token.substring(0, 10)}(truncated)`);

                this.uploadSocket!.emit('auth', data.token);
            });
            this.uploadSocket.on('auth_success', () => Logger.info('DaemonWrapper', 'Upload WebSocket connected and successfully authenticated'));

            this.uploadSocket.on('error', err => Logger.warn('DaemonWrapper', `Upload WebSocket received an error: ${err}`));

            this.uploadSocket.on('connect_error', err => uploadConnectionFailedHandler(err.message));
            this.uploadSocket.on('auth_failed', data => uploadConnectionFailedHandler(data.message));
            this.uploadSocket.on('disconnect', () => Logger.info('DaemonWrapper', 'Upload WebSocket disconnected'));

            this.siofu = new SocketIOFileUpload(this.uploadSocket);
        }

        return;
    }

    async disconnect() {
        this.socket?.disconnect();
        delete this.socket;

        this.siofu?.destroy();
        delete this.siofu;

        this.uploadSocket?.disconnect();
        delete this.uploadSocket;
    }

    on(event: string, cb: (...args: any[]) => any) {
        this.socket?.on(event, cb);
    }

    onAny(cb: (...args: any[]) => any) {
        this.socket?.onAny(cb);
    }

    emit(event: string, ...args: any[]) {
        this.socket?.emit(event, ...args);
    }
}
