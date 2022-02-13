import { BaseModel } from './BaseModel';
import { ScheduleTask } from './ScheduleTask';

export class Schedule extends BaseModel {
    public id = -1;
    public name = '';
    public cron = {
        minute: '',
        hour: '',
        dayOfWeek: '',
        dayOfMonth: ''
    };
    public isActive = false;
    public isProcessing = false;
    public lastRunAt?: '';
    public nextRunAt = '';
    public createdAt = '';
    public updatedAt = '';

    get tasks(): ScheduleTask[] {
        return this.getRelationship('tasks');
    }

    getRouteName() {
        return 'schedule';
    }

    getRouteID() {
        return this.id.toString();
    }
}
