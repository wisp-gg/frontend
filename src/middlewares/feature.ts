import { computed, watch } from 'vue';
import { RouteLocationNormalized } from 'vue-router';
import { hasFeatures, featuresStateLoaded } from '~/plugins';

class Feature implements Middleware {
    name() {
        return 'feature';
    }

    async run(to: RouteLocationNormalized) {
        if (to.meta?.feature) {
            const feature = to.meta?.feature;
            const result = computed(() => hasFeatures(feature));

            if (!featuresStateLoaded(feature)) {
                const unregister = watch(result, () => {
                    unregister();

                    if (!result.value) {
                        return {
                            name: '404',
                            params: {
                                catchAll: location.pathname.substring(1),
                            },
                            query: to.query,
                            hash: to.hash,
                        };
                    }
                });
            } else if(!result.value) {
                return {
                    name: '404',
                    params: {
                        catchAll: location.pathname.substring(1),
                    },
                    query: to.query,
                    hash: to.hash,
                };
            }
        }
    }
}

export default new Feature();
