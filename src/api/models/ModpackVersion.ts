import { BaseModel } from './BaseModel';

export class ModpackVersion extends BaseModel {
    static Release = 0;
    static Beta = 1;
    static Alpha = 2;

    public versionId = '';
    public name = '';
    public releaseType = -1;
}
