import { onUnmounted } from 'vue';
import state from '~/state';
import { ModelsState } from '~/state/models';

export function onModelLoaded<T extends keyof ModelsState>(model: T, listener: (model: Exclude<ModelsState[T], undefined>) => void) {
    if (state.models[model]) {
        listener(state.models[model] as any);
    }

    const unsubscribe = state.models.$onAction(action => {
        if (action.name === 'set' && action.args[0]?.name === model) {
            listener(action.args[0].model);
        }
    });

    onUnmounted(() => unsubscribe());
}
