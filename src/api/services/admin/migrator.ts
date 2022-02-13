import { Parser } from '~/api';
import { PanelMigration } from '~/api/models';
import RequestService from './request';

interface TriggerMigrationRequest {
    panel_url: string;
    api_key: string;

    locations_node_and_game_data: boolean;
    nests_and_eggs: boolean;
    users: boolean;
}

interface NotifyUsersRequest {
    id: number;
}

class MigratorService {
    getAll(req: PaginatableRequest): Promise<PanelMigration[]> {
        return RequestService.get('/migrator', req)
            .then(Parser.parse);
    }

    migrate(data: TriggerMigrationRequest): Promise<PanelMigration> {
        return RequestService.post('/migrator', data)
            .then(Parser.parse);
    }

    notify(data: NotifyUsersRequest): Promise<void> {
        return RequestService.post(`/migrator/${data.id}/notify`);
    }
}

export default new MigratorService();
