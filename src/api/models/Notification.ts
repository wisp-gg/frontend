import { BaseModel } from './BaseModel';

export class Notification extends BaseModel {
    public type = '';
    public icon = '';
    public url: [string, Record<string, string>?] | undefined;
    public title: TranslatableMessage | undefined;
    public message: TranslatableMessage | undefined;
    public createdAt = '';
}
