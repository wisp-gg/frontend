import RequestService from './request';
import { Parser } from '~/api';
import { Announcement } from '~/api/models';

interface CreateAnnouncementRequest {
    type: string;
    text: string;
    active: boolean;
    displayAtTop: boolean;
}

interface UpdateAnnouncementRequest extends CreateAnnouncementRequest {
    id: number;
}

interface ResendAnnouncementRequest {
    id: number;
}

interface DeleteAnnouncementRequest {
    id: number;
}

class AnnouncementsService {
    getAll(req: PaginatableRequest): Promise<Announcement[]> {
        return RequestService.get('/announcements', req)
            .then(Parser.parse);
    }

    create(data: CreateAnnouncementRequest): Promise<Announcement> {
        return RequestService.post('/announcements', data)
            .then(Parser.parse);
    }

    update(data: UpdateAnnouncementRequest): Promise<Announcement> {
        return RequestService.patch(`/announcements/${data.id}`, data)
            .then(Parser.parse);
    }

    resend(data: ResendAnnouncementRequest): Promise<void> {
        return RequestService.post(`/announcements/${data.id}/resend`);
    }

    delete(data: DeleteAnnouncementRequest): Promise<void> {
        return RequestService.delete(`/announcements/${data.id}`);
    }
}

export default new AnnouncementsService();
