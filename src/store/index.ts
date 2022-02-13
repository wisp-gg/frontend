import { Store } from '~/core';
import server, { ServerStore } from './modules/server';
import alerts, { AlertStore } from './modules/alerts';
import loading, { LoadingStore } from './modules/loading';
import navigation, { NavigationStore } from './modules/navigation';
import user, { UserStore } from './modules/user';
import settings, { SettingsStore } from './modules/settings';
import models, { ModelsStore } from './modules/models';
import lists, { ListsStore } from './modules/lists';

export interface RootState {
    server: ServerStore;
    alerts: AlertStore;
    loading: LoadingStore;
    navigation: NavigationStore;
    user: UserStore;
    settings: SettingsStore;
    models: ModelsStore,
    lists: ListsStore,
}

const toRegister: Record<string, any> = { server, alerts, loading, navigation, user, settings, models, lists };
for(const name in toRegister) {
    Store.registerModule(name, toRegister[name]);
}

