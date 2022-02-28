import { BaseModel } from './BaseModel';
import { Domain } from '~/api/models/Domain';

export class ServerSubdomain extends BaseModel {
    public id = -1;
    public name = '';

    public get domain(): Domain {
        return this.getRelationship('domain');
    }

    public get displayName(): string {
        return `${this.name}.${this.domain.name}`;
    }
}
