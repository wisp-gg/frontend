import { convertDataToCamelCase } from '~/helpers';
import {
    Allocation,
    Announcement,
    ApiKey,
    AuditLog,
    Backup,
    DatabaseHost,
    Egg,
    EggVariable,
    Features,
    File,
    License,
    Location,
    Mod,
    Modpack,
    Nest,
    Node,
    Notification,
    PanelMigration,
    Plugin,
    Schedule,
    ScheduleTask,
    Server,
    ServerDatabase,
    ServerSubuser,
    ServerVariable,
    User
} from './models';

export class Parser {
    static models: Record<string, any> = {
        'allocation': Allocation,
        'announcement': Announcement,
        'api_key': ApiKey,
        'audit_log': AuditLog,
        'backup': Backup,
        'database_host': DatabaseHost,
        'database': ServerDatabase,
        'egg': Egg,
        'egg_variable': EggVariable,
        'features': Features,
        'file': File,
        'license': License,
        'location': Location,
        'mod': Mod,
        'modpack': Modpack,
        'nest': Nest,
        'node': Node,
        'notification': Notification,
        'panel_migration': PanelMigration,
        'plugin': Plugin,
        'schedule': Schedule,
        'schedule_task': ScheduleTask,
        'server': Server,
        'server_subuser': ServerSubuser,
        'server_variable': ServerVariable,
        'user': User,
    };

    static parse(response: APIResponse, returnDataOnlyForLists = false): any {
        if (response.object === 'list') {
            const listResp = response as ListResponse;
            const data = listResp
                .data
                .map(item => Parser.parse(item));

            return returnDataOnlyForLists ? data : {
                object: listResp.object,
                data,
                meta: convertDataToCamelCase(listResp.meta)
            };
        } else {
            response = response as ModelResponse;
            const { object, attributes, meta } = response;
            if (object === 'null_resource') return null;

            const relationships: Record<string, any> = {};
            if (attributes.relationships) {
                for(const relationship in attributes.relationships) {
                    relationships[relationship] = Parser.parse(
                        convertDataToCamelCase(attributes.relationships[relationship]), true
                    );
                }

                delete attributes.relationships;
            }

            if (meta?.extra_objects) {
                for (const extra of meta.extra_objects)
                    relationships[extra.object] = convertDataToCamelCase(extra.attributes);
            }

            if (!Parser.models[response.object]) {
                throw new Error(`API Parser: Model '${response.object}' is not registered?`);
            }

            return new Parser.models[response.object]().initialize(
                convertDataToCamelCase(attributes), relationships
            );
        }
    }
}
