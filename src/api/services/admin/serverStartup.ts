import { Parser } from '~/api';
import RequestService from './request';
import { Server } from '~/api/models';

interface UpdateStartupRequest {
    startup: string;
    egg_id: number;
    docker_image: string;
    skip_scripts: boolean;
    environment: Record<string, string>;
}

class ServerStartupService {
    getAll(): Promise<ListResponse> {
        return RequestService.get('/servers/:server/startup').then(Parser.parse);
    }

    update(data: UpdateStartupRequest): Promise<Server> {
        return RequestService.put('/servers/:server/startup', data)
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }
}

export default new ServerStartupService();
