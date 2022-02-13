import { BaseModel } from './BaseModel';
import { Egg } from '~/api/models/Egg';

export class Mod extends BaseModel {
    public id = -1;
    public name = '';
    public description = '';
    public version = '';
    public category?: string;

    // server only
    public serverState = -1;

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
        if (this.serverState === 1) return ['installing', 'warning', true]; // Installing
        if (this.serverState === 2) return ['uninstall', 'danger', false]; // Installed
        if (this.serverState === 3) return ['uninstalling', 'warning', true]; // Uninstalling
        if (this.serverState === 4) return ['install', 'primary', false]; // Not installed

        return null;
    }
}
