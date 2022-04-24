import state from '~/state';
import { DaemonEventMap, DaemonActionMap, DaemonWrapper } from '~/api/services/daemon';

export function useDaemonEvent<K extends keyof DaemonEventMap>(name: K, listener: (data: DaemonEventMap[K]) => any) {
    const unregister = DaemonWrapper.registerEvent(name, listener);

    // TODO: Clean up events onServerUnmount (make this hook - called when switching to different server or going off server related pages) instead
    const subscribeUnregister = state.navigation.$onAction(action => {
        if (action.name === 'setCurrentRoute') {
            unregister();
            subscribeUnregister();
        }
    });

    return unregister;
}

export function triggerDaemonAction<K extends keyof DaemonActionMap>(name: K, data?: DaemonActionMap[K]) {
    DaemonWrapper.trigger(name, data);
}
