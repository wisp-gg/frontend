import { BaseModel } from './BaseModel';

export class PanelMigration extends BaseModel {
    public id = -1;
    public fqdn = '';
    public failed = false;
    public migratedData = false;
    public notifiedUsers = false;
    public manual = false;
    public createdAt = '';
    public updatedAt = '';
}
