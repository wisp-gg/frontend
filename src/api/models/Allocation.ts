import { BaseModel } from './BaseModel';
import { Server } from './Server';

export class Allocation extends BaseModel {
    public id = -1;
    public primary = false;
    public ip = '';
    public alias?: string;
    public port = -1;

    // Admin
    public get connection(): string {
        return `${this.ip}:${this.port}`;
    }

    public displayName(): string {
        return `${this.alias ?? this.ip}:${this.port}`;
    }

    // Admin
    public get server(): Server {
        return this.getRelationship('server');
    }
}
