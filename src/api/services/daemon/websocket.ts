import { Socket } from 'socket.io-client';
import Logger from '~/core/logger';
import { DaemonActionMap, DaemonEventMap, TransformedDaemonEvent } from './types';

export enum DaemonVersion {
    V1,
}

// Internal events that should bypass transformers.
const INTERNAL_EVENTS = ['upload-start', 'upload-progress', 'upload-complete', 'upload-error'];

export abstract class WebSocketTransformer {
    private version: DaemonVersion = DaemonVersion.V1;
    private events: Record<string, any[]> = {};
    protected socket: Socket | undefined;

    private transformers: Record<number, {
        events: Record<string, TransformedDaemonEvent>,
        actions: Record<string, (...data: any) => any>,
    }> = {};

    // Register all transformations for websocket events and actions
    constructor() {
        // NodeJS-based daemon
        const onConsoleMessage: TransformedDaemonEvent = (data: Record<string, any>) => {
            return ['console-output', data];
        };
        const onStatusUpdate: TransformedDaemonEvent = (data: Record<string, number>) => {
            const { status } = data;
            return ['server-status', status];
        };
        this.transformers[DaemonVersion.V1] = {
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

    public setCurrentVersion(version: DaemonVersion) {
        this.version = version;
    }

    protected emit(evtName: string, data?: any) {
        if (INTERNAL_EVENTS.includes(evtName)) {
            this.events[evtName]?.forEach(callback => callback(data));
            return;
        }

        if (!this.transformers[this.version]?.events)
            return Logger.warn('WebSocketTransformer', `No transformer configured for version ${this.version}, unable to process ${evtName}...`);
        if (!this.transformers[this.version].events[evtName])
            return Logger.warn('WebSocketTransformer', `No transformer configured for event ${evtName}, unable to process...`);

        const transformed = this.transformers[this.version].events[evtName](data);

        this.events[transformed.shift()]?.forEach(callback => callback(...transformed));
    }

    protected setupEvents() {
        this.socket?.onAny(this.emit.bind(this));
    }

    protected clearEvents() {
        this.events = {};
    }

    public registerEvent<K extends keyof DaemonEventMap>(name: K, callback: (data: DaemonEventMap[K]) => any) {
        this.events[name] = this.events[name] || [];
        this.events[name].push(callback);

        // I would use the returned index from push
        // However, it is possible for the index to change if another item is removed
        // which would change the index of this handler's callback function, so we calculate it when it's time to cleanup
        return () => this.events[name]?.splice(this.events[name]?.indexOf(callback), 1);
    }

    public trigger<K extends keyof DaemonActionMap>(name: K, data?: DaemonActionMap[K]) {
        if (!this.transformers[this.version]?.actions)
            return Logger.warn('WebSocketTransformer', `No transformer configured for version ${this.version}, unable to process ${name}...`);
        if (!this.transformers[this.version].actions[name])
            return Logger.warn('WebSocketTransformer', `No transformer configured for event ${name}, unable to process...`);

        const transformed = this.transformers[this.version].actions[name](data);

        this.socket?.emit(transformed.shift(), ...transformed);
    }
}
