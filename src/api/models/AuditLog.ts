import { BaseModel } from './BaseModel';
import { User } from '~/api/models/User';

interface Device {
    userAgent?: string;
    cityName?: string;
    countryName?: string;
    countryIsoCode?: string;
}

export class AuditLog extends BaseModel {
    public action = '';
    public subaction = '';
    public device: Device = {};
    public metadata: Record<any, any> = {};
    public createdAt = '';

    public get user(): User {
        return this.getRelationship('user');
    }

    public translationKey(): string {
        return `audits.${this.action.replace(/:/g, '.')}.${this.subaction}`;
    }
}
