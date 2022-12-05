import Logger from '~/core/logger';
import { DaemonActionMap, DaemonEventMap } from './types';
import { BaseWebsocket } from './versions/BaseWebsocket';

export enum DaemonVersion {
    V1,
    V2,
}

// Internal events that should bypass transformers.
const INTERNAL_EVENTS = ['upload-start', 'upload-progress', 'upload-complete', 'upload-error'];

export abstract class WebSocketTransformer {
    protected version: DaemonVersion = DaemonVersion.V1;
    private events: Record<string, any[]> = {};
    protected socket?: BaseWebsocket;

    public setCurrentVersion(version: DaemonVersion) {
        this.version = version;
    }

    protected onWebsocketEvent(evtName: string, data?: any) {
        if (INTERNAL_EVENTS.includes(evtName)) {
            this.events[evtName]?.forEach(callback => callback(data));
            return;
        }

        if (!this.socket?.transformers.events)
            return Logger.warn('WebSocketTransformer', `No transformer configured for version ${DaemonVersion[this.version]}, unable to process ${evtName}...`);
        if (!this.socket.transformers.events[evtName])
            return Logger.warn('WebSocketTransformer', `No transformer configured for event ${evtName}, unable to process...`);

        const transformed = this.socket.transformers.events[evtName](data);

        this.events[transformed.shift()]?.forEach(callback => callback(...transformed));
    }

    protected setupEvents() {
        this.socket?.onAny(this.onWebsocketEvent.bind(this));
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
        if (!this.socket?.transformers.actions)
            return Logger.warn('WebSocketTransformer', `No transformer configured for version ${this.version}, unable to process ${name}...`);
        if (!this.socket.transformers.actions[name])
            return Logger.warn('WebSocketTransformer', `No transformer configured for event ${name}, unable to process...`);

        const transformed = this.socket.transformers.actions[name](data);

        this.socket.emit(transformed.shift(), ...transformed);
    }
}
