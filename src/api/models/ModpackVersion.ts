import { BaseModel } from './BaseModel';

export class ModpackVersion extends BaseModel {
    static Release = 1;
    static Beta = 2;
    static Alpha = 3;

    public versionId = '';
    public name = '';
    public releaseType = -1;
}
