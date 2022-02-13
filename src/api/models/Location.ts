import { BaseModel } from './BaseModel';
import { Node } from './Node';

export class Location extends BaseModel {
    public id = -1;
    public short = '';
    public long = '';
    public nodesCount?: number;

    getRouteName() {
        return 'location';
    }

    getRouteID() {
        return this.id.toString();
    }

    public get nodes(): Node[] {
        return this.getRelationship('nodes') || [];
    }
}
