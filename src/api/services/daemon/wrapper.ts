// @ts-ignore
import SocketIOFileUpload from 'socketio-file-upload/client';
import { dispatch, Logger } from '~/core';
import { Server } from '~/api/models';
import { ServerService } from '~/api/services/client';
import { DaemonVersion, WebSocketTransformer } from './websocket';
import { ServerStatus } from './types';
import { DaemonV1, DaemonV2 } from './versions';

class DaemonWrapper extends WebSocketTransformer {
    private id?: string;
    private eventsSetup = false;

    // The promise will resolve before the connection succeeds (as it doesn't matter).
    // It shouldn't be relied on as indicator for "successfully connected".
    async connect(server: Server): Promise<void> {
        await this.disconnect();

        this.setCurrentVersion(server.node.daemonV2 ? DaemonVersion.V2 : DaemonVersion.V1);

        if (server.suspended && this.version === DaemonVersion.V1) {
            Logger.warn(`DaemonWrapper[${server.uuidShort}]`, 'Server is suspended - connection will not work so it will not be attempted.');
            return;
        }

        this.id = server.uuidShort;

        const data = await ServerService.getWebsocket(); // TODO: race condition, we may want to connect as some point, but if we disconnect right after the request starts (and before it ends), it'll keep connecting :/

        Logger.debug(`DaemonWrapper[${server.uuidShort}]`, `Connecting to ${data.url}`);

        switch (this.version) {
            case DaemonVersion.V1:
                this.socket = new DaemonV1();
                break;
            case DaemonVersion.V2:
                this.socket = new DaemonV2();
                break;
            default:
                Logger.error(`DaemonWrapper[${server.uuidShort}]`, `No websocket wrapper for daemon version ${DaemonVersion[this.version]} found.`);
                return;
        }

        await this.socket.connect(data);

        this.registerEvent('server-status', status => {
            dispatch('server/socket/setStatus', status);

            if (status === ServerStatus.OFF) {
                dispatch('server/socket/setProc', undefined);
                dispatch('server/socket/setQuery', undefined);
            }
        });
        this.registerEvent('server-proc', proc => dispatch('server/socket/setProc', proc));
        this.registerEvent('server-query', query => dispatch('server/socket/setQuery', query));

        if (this.socket instanceof DaemonV1) {
            this.socket.on('auth_success', () => {
                if (!this.eventsSetup) {
                    this.setupEvents();
                    this.eventsSetup = true;
                }

                this.onWebsocketEvent('connected');
            });

            if (this.socket.siofu) {
                ['start', 'progress', 'complete', 'error'].forEach(name => {
                    (<DaemonV1>this.socket).siofu.addEventListener(name, (evt: any) => this.onWebsocketEvent(`upload-${name}`, evt));
                });
            }
        }

        if (this.socket instanceof DaemonV2) {
            this.socket.on('auth success', () => {
                if (!this.eventsSetup) {
                    this.setupEvents();
                    this.eventsSetup = true;
                }

                this.onWebsocketEvent('connected');
            });
        }
    }

    async disconnect(): Promise<void> {
        // Do not clear events for now - this should be handled automatically by server.ts plugin for now
        // this.clearEvents(); // TODO: components reload after visiting them - are we able to allow them not to rerender each time for better UX?

        delete this.id;

        await this.socket?.disconnect();
        this.eventsSetup = false;

        dispatch('server/socket/setStatus', undefined);
        dispatch('server/socket/setProc', undefined);
        dispatch('server/socket/setQuery', undefined);

        Logger.info('DaemonWrapper', 'WebSockets reset.');
    }

    getId() {
        return this.id;
    }

    get siofu(): SocketIOFileUpload | undefined {
        if (this.socket instanceof DaemonV1) {
            return this.socket.siofu;
        }
    }
}

export default new DaemonWrapper();
