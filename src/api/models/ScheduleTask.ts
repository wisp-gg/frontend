import { BaseModel } from './BaseModel';

export class ScheduleTask extends BaseModel {
    public id = -1;
    public sequenceId = -1;
    public action = '';
    public payload = '';
    public timeOffset = -1;
    public isProcessing = false;
    public createdAt = -1;
    public updatedAt = -1;
}
