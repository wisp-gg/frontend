import { BaseModel } from './BaseModel';

export class Plugin extends BaseModel {
    public id = -1;
    public name = '';
    public description = '';
    public iconUrl = '';
    public downloads = -1;
    public premium = false;
    public external = false;
}
