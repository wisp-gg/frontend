import { onUnmounted } from 'vue';

function useWindowEvent<K extends keyof WindowEventMap>(name: K, listener: (ev: WindowEventMap[K]) => any, options?: boolean | EventListenerOptions) {
    window.addEventListener(name, listener, options);

    onUnmounted(() => {
        window.removeEventListener(name, listener);
    });
}

export default useWindowEvent;