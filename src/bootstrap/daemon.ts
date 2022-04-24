import state from '~/state';
import { DaemonWrapper } from '~/api/services/daemon';

// TODO: Wait till pinia is initialized
// state.models.$onAction(async action => {
//     const payload = action.args[0] as any;
//
//     if (action.name === 'set' && payload.name === 'server') {
//         // It's possible the model gets updated between e.g. namespace changes but never gets disconnected.
//         if (payload?.model?.uuidShort !== DaemonWrapper.getId()) {
//             await DaemonWrapper.connect(payload?.model);
//         }
//     } else if (action.name === 'clear' && payload === 'server') {
//         await DaemonWrapper.disconnect();
//     }
// });
