import { RouteLocationNormalized } from 'vue-router';
import ServerService from '~/api/services/client/server';

class MaintenanceMode implements Middleware {
    name() {
        return 'maintenance_node';
    }

    async run(to: RouteLocationNormalized) {
        const maintenance = await ServerService.getNodeMaintenanceMode();

        if (to.name !== 'MaintenanceView' && maintenance) {
            return {
                name: 'MaintenanceView',
            };
        }
    }
}

export default new MaintenanceMode();