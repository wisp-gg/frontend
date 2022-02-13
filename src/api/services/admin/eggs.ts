import { Parser } from '~/api';
import { Egg } from '~/api/models';
import RequestService from './request';

interface CreateEggRequest {
    name: string;
    tag: string;
    description: string;
    docker_image: string;
    startup: string;
    config_from: number;
    config_logs: string;
    config_files: string;
    config_startup: string;
    config_stop: string;
    custom_config: string;
}

interface ImportEggRequest {
    import_file: File;
    nest_id: number;
}

interface UpdateScriptsRequest {
    scriptInstall: string;
    scriptIsPrivileged: boolean;
    scriptEntry: string;
    scriptContainer: string;
    copyScriptFrom?: number;

    scriptUpdate: string;
    scriptUpdateIsPrivileged: boolean;
    scriptUpdateEntry: string;
    scriptUpdateContainer: string;
    copyUpdateScriptFrom?: number;
}

interface UpdateThumbnailRequest {
    asset: File;
}

class EggsService {
    getAll(req: PaginatableRequest): Promise<ListResponse> {
        return RequestService.get('/nests/:nest/eggs', {
            include: ['serversCount'],
            ...req,
        })
            .then(Parser.parse);
    }

    get(): Promise<Egg> {
        return RequestService.get('/nests/:nest/eggs/:egg')
            .then(Parser.parse);
    }

    create(data: CreateEggRequest): Promise<Egg> {
        return RequestService.post('/nests/:nest/eggs', {
            ...data,
            include: ['nest']
        })
            .then(Parser.parse);
    }

    import(data: ImportEggRequest) {
        const formData = new FormData();
        formData.append('import_file', data.import_file);

        return RequestService.post(`/nests/${data.nest_id}/eggs/import?include=nest`, formData, {
            'Content-Type': 'multipart/form-data',
        })
            .then(Parser.parse);
    }

    update(data: CreateEggRequest): Promise<Egg> {
        return RequestService.put('/nests/:nest/eggs/:egg', data)
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    updateScripts(data: UpdateScriptsRequest): Promise<Egg> {
        return RequestService.put('/nests/:nest/eggs/:egg/scripts', data)
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    updateThumbnail(data: UpdateThumbnailRequest): Promise<Egg> {
        const formData = new FormData();
        if (data.asset) formData.append('asset', data.asset);

        return RequestService.put('/nests/:nest/eggs/:egg/thumbnail', formData, {
            'Content-Type': 'multipart/form-data',
        })
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }

    delete(): Promise<void> {
        return RequestService.delete('/nests/:nest/eggs/:egg');
    }
}

export default new EggsService();
