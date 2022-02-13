import { BaseModel } from './BaseModel';

export class ServerVariable extends BaseModel {
    public name = '';
    public description = '';
    public envVariable = '';
    public userEditable = false;
    public rules = '';
    public tickable = false;
    public serverValue = '';
}
