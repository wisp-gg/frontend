import { BaseModel } from './BaseModel';

export class License extends BaseModel {
    public plan = '';
    public fqdn = '';
    public nameFirst = '';
    public nameLast = '';
    public expiresAt?: string;
    public addons: string[] = [];
}
