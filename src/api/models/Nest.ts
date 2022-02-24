import { BaseModel } from './BaseModel';
import { Egg } from '~/api/models/Egg';

export class Nest extends BaseModel {
    public name = '';
    public shortName?: string;

    // Admin
    public id = -1;
    public uuid = '';
    public author = '';
    public description?: string;
    public eggsCount?: number;
    public serversCount?: number;

    public get eggs(): Egg[] {
        return this.getRelationship('eggs') || [];
    }

    getRouteName() {
        return 'nest';
    }

    getRouteID() {
        return this.id.toString();
    }
}
