import RequestService from './request';
import { Parser } from '~/api';
import { Schedule } from '~/api/models';

interface CreateScheduleRequest {
    name: string;
    cron_minute: string;
    cron_hour: string;
    cron_day_of_week: string;
    cron_day_of_month: string;
    enabled: boolean;
}

interface DeleteScheduleRequest {
    id: number;
}

class SchedulesService {
    getAll(req: PaginatableRequest): Promise<Schedule[]> {
        return RequestService.get('/servers/:server/schedules', {
            ...req,
            include: 'tasks'
        })
            .then(Parser.parse);
    }

    get(): Promise<Schedule> {
        return RequestService.get('/servers/:server/schedules/:schedule', {
            include: 'tasks'
        })
            .then(Parser.parse);
    }

    create(data: CreateScheduleRequest): Promise<Schedule> {
        return RequestService.post('/servers/:server/schedules', data)
            .then(Parser.parse);
    }

    update(data: CreateScheduleRequest): Promise<Schedule> {
        return RequestService.patch('/servers/:server/schedules/:schedule', data)
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    trigger(): Promise<void> {
        return RequestService.post('/servers/:server/schedules/:schedule/trigger');
    }

    delete(data: DeleteScheduleRequest): Promise<void> {
        return RequestService.delete(`/servers/:server/schedules/${data.id}`);
    }
}

export default new SchedulesService();
