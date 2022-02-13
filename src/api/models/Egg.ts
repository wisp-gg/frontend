import { BaseModel } from './BaseModel';
import { Nest } from '~/api/models/Nest';

export class Egg extends BaseModel {
    public name = '';
    public tag = '';

    public thumbnail: string | null = null;
    public canUpdate = false;

    // Admin only props
    public id = -1;
    public description = '';
    public dockerImage = '';
    public startup = '';
    public configFrom?: number;
    public configLogs = '';
    public configFiles = '';
    public configStartup = '';
    public configStop = '';
    public customConfig = '';

    public scriptInstall = '';
    public scriptIsPrivileged = false;
    public scriptEntry = '';
    public scriptContainer = '';
    public copyScriptFrom?: number;

    public scriptUpdate = '';
    public scriptUpdateIsPrivileged = false;
    public scriptUpdateEntry = '';
    public scriptUpdateContainer = '';
    public copyUpdateScriptFrom?: number;

    public nestId = -1;
    public serversCount?: number;

    getRouteName() {
        return 'egg';
    }

    getRouteID() {
        return this.id.toString();
    }

    public get nest(): Nest {
        return this.getRelationship('nest');
    }
}
