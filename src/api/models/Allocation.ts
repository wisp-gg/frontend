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
        if (this.subdomain) {
            return this.subdomain.hasSrv ? this.subdomain.displayName : `${this.subdomain.displayName}:${this.port}`;
        }

        return `${this.alias ?? this.ip}:${this.port}`;
    }

    public get subdomain(): ServerSubdomain | undefined {
        return this.getRelationship('subdomain');
    }

    // Admin
    public get server(): Server {
        return this.getRelationship('server');
    }
}
