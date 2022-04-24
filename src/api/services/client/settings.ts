import { Logger } from '~/core';
import RequestService from './request';
import state from '~/state';

class SettingsService {
    initializeSettings() {
        return RequestService.get('/settings')
            .then(data => {
                Logger.debug('Settings', 'Fetched instance settings', data);

                state.settings.set(data);
            })
            .finally(() => state.settings.markInitialized());
    }
}

export default new SettingsService();
