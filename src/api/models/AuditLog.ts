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

    public get translationKey(): string {
        return `audits.${this.action.replace(/:/g, '.')}.${this.subaction}`;
    }

    public get iconInfo() {
        switch(this.subaction) {
            case 'create': return ['plus', 'bg-success', 'text-accent-500'];
            case 'update': return ['pencil-alt', 'bg-warning', 'text-warning'];
            case 'delete': return ['trash', 'bg-danger', 'text-danger'];
            case 'trigger': return ['play-circle', 'bg-blue-500', 'text-blue-300'];
            case 'deploy': return ['server', 'bg-blue-500', 'text-blue-300'];
            case 'download': return ['download', 'bg-accent-300', 'text-accent-500'];
            case 'restart':
            case 'crash':
                return ['power-off', 'bg-danger', 'text-danger'];

            default: return ['question', 'bg-accent-200', 'text-accent-500'];
        }
    }
}
