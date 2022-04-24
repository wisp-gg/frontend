import { default as useServerStore } from './server';
import { default as useAlertsStore } from './alerts';
import { default as useLoadingStore } from './loading';
import { default as useNavigationStore } from './navigation';
import { default as useUserStore } from './user';
import { default as useSettingsStore } from './settings';
import { default as useModelsStore } from './models';
import { default as useListsStore } from './lists';

class State {
    get server() {
        return useServerStore();
    }

    get alerts() {
        return useAlertsStore();
    }

    get loading() {
        return useLoadingStore();
    }

    get navigation() {
        return useNavigationStore();
    }

    get user() {
        return useUserStore();
    }

    get settings() {
        return useSettingsStore();
    }

    get models() {
        return useModelsStore();
    }

    get lists() {
        return useListsStore();
    }
}

// TODO: Is it safe to just call this one throughout the whole app?
// TODO: Doesn't even work atm - maybe introduce useState(namespace) to avoid calling pinia before init

export default new State();

// export default {
//     server: useServerStore(),
//     alerts: useAlertsStore(),
//     loading: useLoadingStore(),
//     navigation: useNavigationStore(),
//     user: useUserStore(),
//     settings: useSettingsStore(),
//     models: useModelsStore(),
//     lists: useListsStore()
// };
