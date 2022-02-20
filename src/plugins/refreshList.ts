import { Store, dispatch } from '~/core';

// Implements support for waiting the list refresh to finish (as refresh clears alerts)
export default function (name: string): Promise<void> {
    dispatch('lists/refresh', name);

    return new Promise(resolve => {
        let sawSkeleton = false;
        const unregister = Store.subscribe(action => {
            if (action.type === 'lists/set' && action.payload?.serviceId === name) {
                if (sawSkeleton) {
                    unregister();
                    return resolve();
                } else {
                    sawSkeleton = true;
                }
            }
        });
    });
}
