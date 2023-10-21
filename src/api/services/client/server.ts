import { Parser } from '~/api';
import RequestService from './request';

interface WebsocketResponse {
    url: string;
    upload_url?: string;
    token: string;
}

interface UpdateDetailsRequest {
    server_name: string;
}
interface ServerResponse {
    attributes: {
        relationships: {
            node: {
                attributes: {
                    maintenance_mode: boolean;
                };
            };
        };
    };
}


class ServerService {

    getNodeMaintenanceMode(): Promise<boolean> {
        return RequestService.get('/servers/:server', { include: ['node'] })
            .then((response: ServerResponse) => response.attributes.relationships.node.attributes.maintenance_mode)
            .catch(error => {
                console.error('Error getting node maintenance mode:', error);
                throw error;
            });
    }

    getWebsocket(): Promise<WebsocketResponse> {
        return RequestService.get('/servers/:server/websocket');
    }

    updateDetails(data: UpdateDetailsRequest): Promise<void> {
        return RequestService.patch('/servers/:server/details', {
            name: data.server_name,
        })
            .then(Parser.parse)
            .then(RequestService.updateModelBinding);
    }
}

export default new ServerService();
