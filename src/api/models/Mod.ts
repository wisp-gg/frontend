import { BaseModel } from './BaseModel';
import { Egg } from '~/api/models/Egg';

export enum ModState {
    Installing = 1,
    Installed,
    Uninstalling,
    NotInstalled
}

export class Mod extends BaseModel {
    public id = -1;
    public name = '';
    public description = '';
    public version = '';
    public category?: string;

    // server only
    public serverState: ModState = -1;

    // admin only
    public scriptInstall = '';
    public scriptUninstall = '';
    public inUse = false;

    getRouteName() {
        return 'mod';
    }

    getRouteID() {
        return this.id.toString();
    }

    public get egg(): Egg {
        return this.getRelationship('egg');
    }

    public serverStateInfo() {
        if (this.serverState === ModState.Installing) return ['installing', 'warning', true];
        if (this.serverState === ModState.Installed) return ['uninstall', 'danger', false];
        if (this.serverState === ModState.Uninstalling) return ['uninstalling', 'warning', true];
        if (this.serverState === ModState.NotInstalled) return ['install', 'primary', false];

        return null;
    }
}
