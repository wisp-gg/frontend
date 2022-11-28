import { BaseModel } from './BaseModel';

export class Node extends BaseModel {
    public id = -1;
    public name = '';
    public description = '';
    public connection = {
        fqdn: '',
        display: '',
    };
    public ports = {
        base: -1,
        sftp: -1,
        fastdl: -1,
    };
    public uploadSize = -1;
    public daemonV2 = false;

    // Admin only props
    public public = false;
    public maintenanceMode = false;
    public serversCount?: number;
    public limits = {
        cpu: -1,
        cpuOverallocate: -1,
        memory: -1,
        memoryOverallocate: -1,
        disk: -1,
        diskOverallocate: -1,
    };
    public cpuUsage = -1;
    public memoryUsage = -1;
    public diskUsage = -1;

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

    public get cpuLimit() {
        return this.limits.cpu * (1 + (this.limits.cpuOverallocate / 100));
    }

    public get memoryLimit() {
        return this.limits.memory * (1 + (this.limits.memoryOverallocate / 100));
    }

    public get diskLimit() {
        return this.limits.disk * (1 + (this.limits.diskOverallocate / 100));
    }
}
