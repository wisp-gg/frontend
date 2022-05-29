import { BaseModel } from './BaseModel';
import { ModpackVersion } from './ModpackVersion';

export class Modpack extends BaseModel {
    public id = '';
    public name = '';
    public description = '';
    public thumbnailUrl = '';
    public websiteUrl = '';
    public downloads = -1;
    public updatedAt = '';

    public get versions(): ModpackVersion[] {
        return this.getRelationship('versions');
    }
}
