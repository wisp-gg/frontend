import state from '~/state';

// Implements support for waiting the list refresh to finish (as refresh clears alerts)
export default function (name: string): Promise<void> {
    state.lists.refresh(name);

    return new Promise(resolve => {
        let sawSkeleton = false;
        const unregister = state.lists.$onAction(action => {
            if (action.name === 'set' && action.args[0]?.serviceId === name) {
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
