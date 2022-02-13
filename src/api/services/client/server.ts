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

class ServerService {
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
