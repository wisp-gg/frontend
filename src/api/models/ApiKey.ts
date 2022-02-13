import { BaseModel } from './BaseModel';

export class ApiKey extends BaseModel {
    public identifier = '';
    public token = '';
    public memo = '';
    public lastUsedAt?: number;
    public createdAt = -1;

    // following resources are only for application api key
    public userId = -1;
    public rUsers = -1;
    public rAllocations = -1;
    public rDatabaseHosts = -1;
    public rServerDatabases = -1;
    public rEggs = -1;
    public rLocations = -1;
    public rNests = -1;
    public rNodes = -1;
    public rServers = -1;

    get user() {
        return this.getRelationship('user');
    }

    getRouteName() {
        return 'apiKey';
    }

    getRouteID() {
        return this.identifier.toString();
    }

    // Return all the available resources based on the prototype information
    static get resources() {
        const res = [];
        for(const a in new this()) {
            if (!a.startsWith('r') || a.substring(1, 2).toUpperCase() !== a.substring(1, 2)) continue;
            res.push(a);
        }

        return res;
    }
}
