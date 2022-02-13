import RequestService from './request';

class FastdlService {
    sync(): Promise<void> {
        return RequestService.post('/servers/:server/fastdl');
    }
}

export default new FastdlService();
