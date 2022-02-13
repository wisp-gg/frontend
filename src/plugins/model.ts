import { onUnmounted } from 'vue';
import { state, Store } from '~/core';
import { ModelsStore } from '~/store/modules/models';

export function onModelLoaded<T extends keyof ModelsStore>(model: T, listener: (model: Exclude<ModelsStore[T], undefined>) => void) {
    if (state.models[model]) {
        listener(state.models[model] as any);
    }

    const unsubscribe = Store.subscribe(mutation => {
        if (mutation.type === 'models/set' && mutation.payload?.name === model) {
            listener(mutation.payload.model);
        }
    });

    onUnmounted(() => unsubscribe());
}
