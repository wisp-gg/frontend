import { Logger, dispatch } from '~/core';
import RequestService from './request';

class SettingsService {
    initializeSettings() { // TODO: consider data injected from backend
        return RequestService.get('/settings')
            .then(data => {
                Logger.debug('Settings', 'Fetched instance settings', data);

                dispatch('settings/set', data);
            })
            .finally(() => dispatch('settings/markInitialized'));
    }
}

export default new SettingsService();
