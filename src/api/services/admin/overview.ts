import RequestService from './request';
import { Parser } from '~/api';

class OverviewService {
    license(): Promise<void> {
        return RequestService.get('/license')
            .then(Parser.parse);
    }
}

export default new OverviewService();
