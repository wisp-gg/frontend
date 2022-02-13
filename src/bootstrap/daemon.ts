import { Store } from '~/core';
import { DaemonWrapper } from '~/api/services/daemon';

Store.subscribe(mutation => {
    if (mutation.type === 'models/set' && mutation.payload?.name === 'server') {
        DaemonWrapper.connect(mutation.payload?.model);
    } else if (mutation.type === 'models/clear' && mutation.payload === 'server') {
        DaemonWrapper.disconnect();
    }
});
