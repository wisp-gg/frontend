import { BaseModel } from './BaseModel';
import { User } from './User';

export class ServerSubuser extends BaseModel {
    public id = -1;
    public permissions: string[] = [];

    public get user(): User {
        return this.getRelationship('user');
    }
}
