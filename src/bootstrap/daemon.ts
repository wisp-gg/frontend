import { Store } from '~/core';
import { DaemonWrapper } from '~/api/services/daemon';

Store.subscribe(async mutation => {
    if (mutation.type === 'models/set' && mutation.payload?.name === 'server') {
        // It's possible the model gets updated between e.g. namespace changes but never gets disconnected.
        if (mutation.payload?.model?.uuidShort !== DaemonWrapper.getId()) {
            await DaemonWrapper.connect(mutation.payload?.model);
        }
    } else if (mutation.type === 'models/clear' && mutation.payload === 'server') {
        await DaemonWrapper.disconnect();
    }
});
