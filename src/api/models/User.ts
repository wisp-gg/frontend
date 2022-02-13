import { BaseModel } from './BaseModel';
import { Announcement } from './Announcement';
import { Notification } from './Notification';

export enum NavBarPosition {
    LEFT,
    TOP,
}

interface UserPreferences {
    navbarPosition: NavBarPosition;
    language: string;
}

export class User extends BaseModel {
    public email = '';
    public nameFirst = '';
    public nameLast = '';
    public useTotp = false;

    public get fullName(): string {
        return `${this.nameFirst} ${this.nameLast}`;
    }

    public get selectorName(): string {
        return `${this.nameFirst} ${this.nameLast} (${this.email})`;
    }

    // Currently authenticated user props (or if in admin area)
    public id = -1;
    public preferences: UserPreferences | undefined;
    public rootAdmin = false;
    public supportOp = false;
    public ssoEnabled = false;

    public get permissions(): string[] {
        return this.getRelationship('permissions') || [];
    }

    public get announcements(): Announcement[] {
        return this.getRelationship('announcements') || [];
    }

    public get notifications(): Notification[] {
        return this.getRelationship('notifications') || [];
    }

    public hasUnreadAnnouncements() {
        return this.announcements.length > 0;
    }

    public hasUnreadNotifications() {
        return this.notifications.length > 0;
    }

    // Admin-only props
    public externalId = -1;
    public supportOpBypass = false;
    public sso = false;
    public serversCount = 0;

    getRouteName() {
        return 'user';
    }

    getRouteID() {
        return this.id.toString();
    }
}
