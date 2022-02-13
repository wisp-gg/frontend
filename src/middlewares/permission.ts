import { computed, watch } from 'vue';
import { RouteLocationNormalized } from 'vue-router';
import { hasPermissions, permissionsStateLoaded } from '~/plugins';

class Permission implements Middleware {
    name() {
        return 'permission';
    }

    async run(to: RouteLocationNormalized) {
        if (to.meta?.permission) {
            const permission = to.meta?.permission;
            const result = computed(() => hasPermissions(permission));

            if (!permissionsStateLoaded(permission)) {
                const unregister = watch(result, () => {
                    unregister();

                    if (!result.value) {
                        // TODO: this should be a 403 instead
                        return {
                            name: '404',
                            params: {
                                catchAll: to.path.split('/').slice(1).join('/'),
                            },
                            query: to.query,
                            hash: to.hash,
                        };
                    }
                });
            } else if(!result.value) {
                // TODO: this should be a 403 instead
                return {
                    name: '404',
                    params: {
                        catchAll: to.path.split('/').slice(1).join('/'),
                    },
                    query: to.query,
                    hash: to.hash,
                };
            }
        }
    }
}

export default new Permission();
