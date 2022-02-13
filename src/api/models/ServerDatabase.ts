import { BaseModel } from './BaseModel';
import { DatabaseHost } from './DatabaseHost';
import { Server } from './Server';

export class ServerDatabase extends BaseModel {
    public id = -1;
    public name = '';
    public remote = '';
    public username = '';
    public password = '';

    public get host(): DatabaseHost {
        return this.getRelationship('host');
    }

    // Admin only methods/getters
    public get server(): Server {
        return this.getRelationship('server');
    }
}
