import { BaseModel } from './BaseModel';

export class Domain extends BaseModel {
    public id = -1;
    public name = '';

    // Admin only props
    public serversCount = -1;

    getRouteName() {
        return 'domain';
    }

    getRouteID() {
        return this.id.toString();
    }
}
