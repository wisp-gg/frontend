import { io, Socket } from 'socket.io-client';
// @ts-ignore
import SocketIOFileUpload from 'socketio-file-upload/client';
import { dispatch, Logger } from '~/core';
import { Server } from '~/api/models';
import { ServerService } from '~/api/services/client';
import { ServerStatus } from './types';
import { WebSocketTransformer, DaemonVersion } from './websocket';

class DaemonWrapper extends WebSocketTransformer {
    protected uploadSocket: Socket | undefined;
    protected id: string | undefined;
    public siofu: SocketIOFileUpload | undefined;

    // The promise will resolve before the connection succeeds (as it doesn't matter).
    // It shouldn't be relied on as indicator for "successfully connected".
    async connect(server: Server): Promise<void> {
        await this.disconnect();

        if (server.suspended && this.version === DaemonVersion.V1) {
            Logger.warn(`DaemonWrapper[${server.uuidShort}]`, 'Server is suspended - connection will not work so it will not be attempted.');
            return;
        }

        this.id = server.uuidShort;

        const { url, upload_url, token } = await ServerService.getWebsocket(); // TODO: race condition, we may want to connect as some point, but if we disconnect right after the request starts (and before it ends), it'll keep connecting :/

        Logger.debug(`DaemonWrapper[${server.uuidShort}]`, `Connecting to ${url}`);

        this.socket = io(url, {
            transports: ['websocket'],
        });

        const connectionFailedHandler = (message: string) => {
            Logger.warn(`DaemonWrapper[${server.uuidShort}]`, `WebSocket connection failed: ${message}`);

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

        this.socket.on('error', err => Logger.warn(`DaemonWrapper[${server.uuidShort}]`, `WebSocket received an error: ${err}`));
        this.socket.on('connect_error', err => connectionFailedHandler(err.message));
        this.socket.on('auth_failed', data => connectionFailedHandler(data.message));

        this.socket.on('connect', () => {
            Logger.debug(`DaemonWrapper[${server.uuidShort}]`, `WebSocket connected, attempting to authenticate with token ${token.substring(0, 10)}(truncated)`);

            this.socket!.emit('auth', token);
        });

        this.socket.on('auth_success', () => {
            Logger.info(`DaemonWrapper[${server.uuidShort}]`, 'WebSocket connected and successfully authenticated');

            dispatch('server/socket/setState', true);
            this.emit('connected');
        });
        this.socket.once('auth_success', () => this.setupEvents());

        this.socket.on('disconnect', () => {
            Logger.info(`DaemonWrapper[${server.uuidShort}]`, 'WebSocket disconnected');

            dispatch('server/socket/setState', false);
        });

        this.registerEvent('server-status', status => {
            dispatch('server/socket/setStatus', status);

            if (status === ServerStatus.OFF) {
                dispatch('server/socket/setProc', undefined);
                dispatch('server/socket/setQuery', undefined);
            }
        });
        this.registerEvent('server-proc', proc => dispatch('server/socket/setProc', proc));
        this.registerEvent('server-query', query => dispatch('server/socket/setQuery', query));

        // Setup the upload socket - if something goes really wrong here, it isn't critical so this is mostly here as a "best effort"
        if (upload_url) {
            const uploadConnectionFailedHandler = (message: string) => {
                Logger.warn(`DaemonWrapper[${server.uuidShort}]`, `Upload WebSocket connection failed: ${message}`);
            };

            this.uploadSocket = io(upload_url, {
                query: { token },
                transports: ['websocket'],
            });

            this.uploadSocket.on('connect', () => {
                Logger.info(`DaemonWrapper[${server.uuidShort}]`, `Upload WebSocket connected, attempting to authenticate with token ${token.substring(0, 10)}(truncated)`);

                this.uploadSocket!.emit('auth', token);
            });
            this.uploadSocket.on('auth_success', () => Logger.info(`DaemonWrapper[${server.uuidShort}]`, 'Upload WebSocket connected and successfully authenticated'));

            this.uploadSocket.on('error', err => Logger.warn(`DaemonWrapper[${server.uuidShort}]`, `Upload WebSocket received an error: ${err}`));

            this.uploadSocket.on('connect_error', err => uploadConnectionFailedHandler(err.message));
            this.uploadSocket.on('auth_failed', data => uploadConnectionFailedHandler(data.message));
            this.uploadSocket.on('disconnect', () => Logger.info(`DaemonWrapper[${server.uuidShort}]`, 'Upload WebSocket disconnected'));

            this.siofu = new SocketIOFileUpload(this.uploadSocket);
            ['start', 'progress', 'complete', 'error'].forEach(name => {
                this.siofu.addEventListener(name, (evt: any) => this.emit(`upload-${name}`, evt));
            });
        }
    }

    async disconnect(): Promise<void> {
        // Do not clear events for now - this should be handled automatically by server.ts plugin for now
        // this.clearEvents(); // TODO: components reload after visiting them - are we able to allow them not to rerender each time for better UX?

        delete this.id;

        this.socket?.disconnect();
        delete this.socket;

        this.siofu?.destroy();
        delete this.siofu;

        this.uploadSocket?.disconnect();
        delete this.uploadSocket;

        dispatch('server/socket/setStatus', undefined);
        dispatch('server/socket/setProc', undefined);
        dispatch('server/socket/setQuery', undefined);

        Logger.info('DaemonWrapper', 'WebSockets reset.');
    }

    getId() {
        return this.id;
    }
}

export default new DaemonWrapper();
