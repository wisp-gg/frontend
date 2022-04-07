import { BaseModel } from './BaseModel';
import { Server } from './Server';
import { ServerSubdomain } from './ServerSubdomain';

export class Allocation extends BaseModel {
    public id = -1;
    public primary = false;
    public ip = '';
    public port = -1;

    // Admin - ip is replaced by alias if applicable on client api
    public alias?: string;

    public get connection(): string {
        return `${this.ip}:${this.port}`;
    }

    public displayName(): string {
        // TODO: Technically, the port should be included if subdomain doesn't have an srv record - but we don't know that here

        return this.subdomain?.displayName ?? `${this.alias ?? this.ip}:${this.port}`;
    }

    public get subdomain(): ServerSubdomain | undefined {
        return this.getRelationship('subdomain');
    }

    // Admin
    public get server(): Server {
        return this.getRelationship('server');
    }
}
