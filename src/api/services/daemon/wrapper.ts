import { io, Socket } from 'socket.io-client';
// @ts-ignore
import SocketIOFileUpload from 'socketio-file-upload/client';
import { Logger } from '~/core';
import state from '~/state';

import { Server } from '~/api/models';
import { ServerService } from '~/api/services/client';
import { ServerStatus } from './types';
import { WebSocketTransformer } from './websocket';

class DaemonWrapper extends WebSocketTransformer {
    protected uploadSocket: Socket | undefined;
    protected id: string | undefined;
    public siofu: SocketIOFileUpload | undefined;

    // The promise will resolve before the connection succeeds (as it doesn't matter).
    // It shouldn't be relied on as indicator for "successfully connected".
    async connect(server: Server): Promise<void> {
        await this.disconnect();
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

            state.server.setError(message);
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

            state.server.setState(true);
            this.emit('connected');
        });
        this.socket.once('auth_success', () => this.setupEvents());

        this.socket.on('disconnect', () => {
            Logger.info(`DaemonWrapper[${server.uuidShort}]`, 'WebSocket disconnected');

            state.server.setState(false);
        });

        this.registerEvent('server-status', status => {
            state.server.setStatus(status);

            if (status === ServerStatus.OFF) {
                state.server.setProc(undefined);
                state.server.setQuery(undefined);
            }
        });
        this.registerEvent('server-proc', proc => state.server.setProc(proc));
        this.registerEvent('server-query', query => state.server.setQuery(query));

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

        state.server.setStatus(undefined);
        state.server.setProc(undefined);
        state.server.setQuery(undefined);

        Logger.info('DaemonWrapper', 'WebSockets reset.');
    }

    getId() {
        return this.id;
    }
}

export default new DaemonWrapper();
