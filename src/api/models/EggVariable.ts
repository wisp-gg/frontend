import { BaseModel } from './BaseModel';

export class EggVariable extends BaseModel {
    public id = -1;
    public name = '';
    public description = '';
    public envVariable = '';
    public defaultValue = '';
    public userViewable = false;
    public userEditable = false;
    public rules = '';
    public tickable = false;

    // Workaround as vue doesn't like `{{{{ envVariable }}}}` to show {{SERVER_JAR}} for example...
    get startupUsage() {
        return `{{${this.envVariable}}}`;
    }
}
