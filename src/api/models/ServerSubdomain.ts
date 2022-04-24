import { BaseModel } from './BaseModel';
import { Allocation } from './Allocation';

export class ServerSubdomain extends BaseModel {
    public id = -1;
    public name = '';
    public displayName = '';
    public hasSrv = false;

    public get allocation(): Allocation | undefined {
        return this.getRelationship('allocation');
    }
}
