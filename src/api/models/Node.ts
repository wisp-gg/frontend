import { BaseModel } from './BaseModel';

export class Node extends BaseModel {
    public id = -1;
    public name = '';
    public description = '';
    public connection = {
        behindProxy: false,
        fqdn: '',
        display: '',
    };
    public ports = {
        base: -1,
        sftp: -1,
        fastdl: -1,
    };
    public limits = {
        cpu: -1,
        cpuOverallocate: -1,
        memory: -1,
        memoryOverallocate: -1,
        disk: -1,
        diskOverallocate: -1,
    };
    public uploadSize = -1;

    // Admin only props
    public public = false;
    public maintenanceMode = false;
    public serversCount?: number;

    getRouteName() {
        return 'node';
    }

    getRouteID() {
        return this.id.toString();
    }

    public get displayFqdn() {
        return this.connection.display || this.connection.fqdn;
    }

    public get fastDlUrl() {
        return `http://${this.displayFqdn}${this.ports.fastdl === 80 ? '' : `:${this.ports.fastdl}`}`;
    }

    public get websocketUrl() {
        return `wss://${this.connection.fqdn}:${this.ports.base}`;
    }

    public get location(): Location {
        return this.getRelationship('location');
    }
}
