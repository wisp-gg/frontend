import { BaseModel } from './BaseModel';

export class Backup extends BaseModel {
    public uuid = '';
    public uuidShort = '';
    public name = '';
    public sha256Hash = '';
    public bytes = -1;
    public locked = false;
    public creating = false;
    public createdAt = '';
}
