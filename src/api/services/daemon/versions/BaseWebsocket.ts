import { Transformers } from '../types';

export interface WebSocketConnectData {
    url: string;
    upload_url?: string;
    token: string;
}

export abstract class BaseWebsocket {
    public transformers: Transformers = { events: {}, actions: {} };

    abstract connect(data: WebSocketConnectData): Promise<void>;
    abstract disconnect(): Promise<void>;

    abstract on(event: string, cb: (...args: any[]) => any): void;
    abstract onAny(cb: (...args: any[]) => any): void
    abstract emit(event: string, ...args: any[]): void;
}
