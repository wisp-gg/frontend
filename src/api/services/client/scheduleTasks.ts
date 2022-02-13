import RequestService from './request';
import { Parser } from '~/api';
import { ScheduleTask } from '~/api/models';
import { dispatch } from '~/core';

interface CreateTaskRequest {
    action: string;
    time_offset: number;
    payload?: string;
}

interface UpdateTaskRequest extends CreateTaskRequest {
    id: number;
}

interface DeleteTaskRequest {
    id: number;
}

class ScheduleTasksService {
    create(data: CreateTaskRequest): Promise<ScheduleTask> {
        return RequestService.post('/servers/:server/schedules/:schedule/tasks', data)
            .then(Parser.parse)
            .then((task: ScheduleTask) => {
                dispatch('models/refresh', 'schedule');

                return task;
            });
    }

    update(data: UpdateTaskRequest): Promise<ScheduleTask> {
        return RequestService.patch(`/servers/:server/schedules/:schedule/tasks/${data.id}`, data)
            .then(Parser.parse)
            .then((task: ScheduleTask) => {
                dispatch('models/refresh', 'schedule');

                return task;
            });
    }

    delete(data: DeleteTaskRequest): Promise<void> {
        return RequestService.delete(`/servers/:server/schedules/:schedule/tasks/${data.id}`)
            .then(() => dispatch('models/refresh', 'schedule'));
    }
}

export default new ScheduleTasksService();
