import { io, Socket } from 'socket.io-client';
// @ts-ignore
import SocketIOFileUpload from 'socketio-file-upload/client';
import { Logger, dispatch } from '~/core';
import { Server } from '~/api/models';
import { ServerService } from '~/api/services/client';
import { ServerStatus } from './types';
import { WebSocketTransformer } from './websocket';

class DaemonWrapper extends WebSocketTransformer {
    protected uploadSocket: Socket | undefined;
    public siofu: SocketIOFileUpload | undefined;

    // The promise will resolve before the connection succeeds (as it doesn't matter).
    // It shouldn't be relied on as indicator for "successfully connected".
    async connect(server: Server): Promise<void> {
        const { url, upload_url, token } = await ServerService.getWebsocket(); // TODO: race condition, we may want to connect as some point, but if we disconnect right after the request starts (and before it ends), it'll keep connecting :/

        Logger.debug(`DaemonWrapper[${server.uuidShort}]`, `Connecting to ${url}`);

        this.socket = io(url, {
            query: { token },
            transports: ['websocket'],
        });

        this.socket.on('error', err => Logger.warn(`DaemonWrapper[${server.uuidShort}]`, `WebSocket received an error: ${err}`));
        this.socket.on('connect_error', err => {
            Logger.warn(`DaemonWrapper[${server.uuidShort}]`, `WebSocket connection failed: ${err}`);

            let errorCode = err.message;

            switch(errorCode.toLowerCase()) { // Convert any errors we don't control to translated format
                case 'websocket error':
                case 'timeout':
                    errorCode = 'errors.socket.trouble_connecting';
                    break;
                case 'invalid namespace':
                    errorCode = 'errors.socket.invalid_namespace';
                    break;
            }

            dispatch('server/socket/setError', errorCode);
        });
        this.socket.on('connect', () => {
            Logger.info(`DaemonWrapper[${server.uuidShort}]`, 'WebSocket connected.');

            dispatch('server/socket/setState', true);
            this.emit('connected');
        });
        this.socket.once('connect', () => this.setupEvents());
        this.socket.on('disconnect', () => {
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
            this.uploadSocket = io(upload_url, {
                query: { token },
                transports: ['websocket'],
            });
            this.uploadSocket.on('error', err => Logger.warn(`DaemonWrapper[${server.uuidShort}]`, `Upload WebSocket received an error: ${err}`));
            this.uploadSocket.on('connect', () => Logger.info(`DaemonWrapper[${server.uuidShort}]`, 'Upload WebSocket connected.'));
            this.uploadSocket.on('connect_error', err => Logger.warn(`DaemonWrapper[${server.uuidShort}]`, `Upload WebSocket connection failed: ${err}`));
            this.uploadSocket.on('disconnect', () => Logger.info(`DaemonWrapper[${server.uuidShort}]`, 'Upload WebSocket disconnected.'));

            this.siofu = new SocketIOFileUpload(this.uploadSocket);
            ['start', 'progress', 'complete', 'error'].forEach(name => {
                this.siofu.addEventListener(name, (evt: any) => this.emit(`upload-${name}`, evt));
            });
        }
    }

    async disconnect(): Promise<void> {
        this.clearEvents(); // TODO: components reload after visiting them - are we able to allow them not to rerender each time for better UX?

        this.socket?.disconnect();
        delete this.socket;

        this.siofu?.destroy();
        delete this.siofu;

        this.uploadSocket?.disconnect();
        delete this.uploadSocket;

        dispatch('server/socket/setStatus', undefined);
        dispatch('server/socket/setProc', undefined);
        dispatch('server/socket/setQuery', undefined);

        Logger.info('DaemonWrapper', 'WebSockets disconnected.');
    }
}

export default new DaemonWrapper();