import { BaseModel } from './BaseModel';

export class SecurityKey extends BaseModel {
    public id = -1;
    public name = '';
    public type = '';
    public createdAt = '';
    public lastUsedAt = '';
}
