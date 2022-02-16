import { Parser } from '~/api';
import { Server } from '~/api/models';
import { dispatch } from '~/core';
import RequestService from './request';

interface CreateServerRequest {
    name: string;
    description?: string;
    owner_id: number;
    egg_id: number;
    docker_image?: string;
    startup?: string;
    environment: Record<string, any>;
    skip_scripts?: boolean;
    start_on_completion?: boolean;

    cpu: number;
    memory: number;
    swap: number;
    disk: number;
    io: number;

    databases_limit: number;
    allocations_limit: number;
    backup_megabytes_limit: number;

    primary_allocation_id: number;
    secondary_allocation_ids: number[];
}

interface DeleteServerRequest {
    force: boolean;
}

interface UpdateDetailsRequest {
    name: string;
    external_id?: string;
    description: string;
    owner_id: number;
}

interface UpdateBuildRequest {
    cpu: number;
    memory: number;
    swap: number;
    disk: number;
    io: number;
    databases_limit: number;
    allocations_limit: number;
    backup_megabytes_limit: number;
    allocation_id: number;
    add_allocation_ids: number[];
    remove_allocation_ids: number[];
}

interface SuspendServerRequest {
    suspended: boolean;
}

interface MoveServerRequest {
    location_id: number;
    node_id?: number;
}

class ServersService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/servers', {
            ...req,
            include: ['node', 'allocations', 'user'],
        })
            .then(Parser.parse);
    }

    get(): Promise<Server> {
        return RequestService.get('/servers/:server', {
            include: ['node', 'nest', 'egg', 'allocations', 'user', 'features'],
        }).then(Parser.parse);
    }

    create(data: CreateServerRequest): Promise<Server> {
        return RequestService.post('/servers', data).then(Parser.parse);
    }

    delete(data: DeleteServerRequest): Promise<void> {
        return RequestService.delete('/servers/:server', data);
    }

    updateDetails(data: UpdateDetailsRequest): Promise<Server> {
        return RequestService.put('/servers/:server/details', {
            ...data,
            description: data.description.length > 0 ? data.description : "null"
        })
            .then(Parser.parse)
            .then(server => {
                dispatch('models/refresh', 'server');

                return server;
            });
    }

    updateBuild(data: UpdateBuildRequest): Promise<Server> {
        return RequestService.put('/servers/:server/build', data)
            .then(Parser.parse)
            .then(server => {
                dispatch('models/refresh', 'server');

                return server;
            });
    }

    reinstall(): Promise<Server> {
        return RequestService.post('/servers/:server/reinstall')
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    toggleInstall(): Promise<Server> {
        return RequestService.post('/servers/:server/toggle-install')
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    rebuild(): Promise<Server> {
        return RequestService.post('/servers/:server/rebuild')
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    suspend(data: SuspendServerRequest): Promise<Server> {
        return RequestService.post('/servers/:server/suspension', data)
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    toggleUpdate(): Promise<Server> {
        return RequestService.post('/servers/:server/toggle-update')
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    move(data: MoveServerRequest): Promise<Server> {
        return RequestService.post('/servers/:server/move')
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    toggleMove(): Promise<Server> {
        return RequestService.post('/servers/:server/toggle-move')
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    resetMods(): Promise<Server> {
        return RequestService.post('/servers/:server/reset-mods')
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }
}

export default new ServersService();
