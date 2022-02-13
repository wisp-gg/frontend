import { BaseModel } from './BaseModel';

export class Announcement extends BaseModel {
    public type = '';
    public text = '';

    // Admin only props
    public id = -1;
    public active = false;
    public createdAt = '';
    public updatedAt = '';
}
