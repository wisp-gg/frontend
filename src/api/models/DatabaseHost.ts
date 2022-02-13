import { BaseModel } from './BaseModel';
import { Node } from '~/api/models/Node';
import { ServerDatabase } from '~/api/models/ServerDatabase';

export class DatabaseHost extends BaseModel {
    public id = -1;
    public name = '';
    public host = '';
    public port = -1;
    public displayFqdn = '';
    public enablePhpmyadmin = false;

    // Admin only props
    public username = '';
    public maxDatabases?: number = undefined;

    getRouteID() {
        return this.id.toString();
    }

    connection(): string {
        return `${this.host}:${this.port}`;
    }

    phpmyadminUrl(): string | undefined {
        return this.enablePhpmyadmin ? `http://${this.displayFqdn || this.host}/phpmyadmin/index.php` : undefined;
    }

    // Admin only relations
    get node(): Node | undefined {
        return this.getRelationship('node');
    }

    get databases(): ServerDatabase[] | undefined {
        return this.getRelationship('databases');
    }
}
