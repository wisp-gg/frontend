import { computed, watch } from 'vue';
import { RouteRecordRaw } from 'vue-router';
import { getRouteParams } from '~/helpers';
import { Logger, Router, Lang } from '~/core';
import { globalMiddlewares } from '~/routes';
import state from '~/state';
import { RouteData } from '~/state/navigation';
import { Passthrough, TabberPassthrough } from '~/views';

// TODO: Wait till pinia is initialized
// const pageTitle = computed(() => {
//     const branding = state.settings.data?.branding?.name || 'WISP';
//     const routeName = Router.currentRoute.value.name?.toString();
//     const routeMatched = Router.currentRoute.value.matched;
//     if (!routeName || routeMatched.length < 0) return `${branding} | Game Panel`;
//
//     const routeTranslation = Lang.global.t(`navigation.${routeName}.title`);
//
//     // TODO: this should also consider (Tabber)Passthrough with separation of admin and client area
//     const route = routeMatched[routeMatched.length - 1];
//     for(const path of route.path.split('/')) {
//         if (!path.startsWith(':')) continue;
//
//         const paramName = path.substring(1);
//         if (paramName in state.models) {
//             const model = state.models[paramName];
//             if (!model.name) continue;
//
//             return `${branding} | ${model.name} - ${routeTranslation}`;
//         }
//     }
//
//     return `${branding} | ${routeTranslation}`;
// });
// watch(pageTitle, (value: string) => document.title = value);

function normalizeMiddleware(middleware: Middleware | [Middleware, number]) {
    return Array.isArray(middleware) ? middleware : [middleware, 0];
}

function getMiddlewares(global: PrioritizationMiddleware = [], route: undefined | PrioritizationMiddleware = []) {
    return global
        .map(normalizeMiddleware)
        .concat(
            route.map(normalizeMiddleware)
        )
        .sort((a, b) => (b[1] as number) - (a[1] as number)) // TypeScript plz, why do you think a[1] is not a number???
        .map(middleware => middleware[0]) as Middleware[];
}

Router.beforeEach(async (to, from, next) => {
    state.alerts.clear();

    const { user: { initialized: initializedUser }, settings: { initialized: initializedSettings } } = state;
    if (!initializedUser || !initializedSettings) {
        Logger.debug('Router', 'User and/or settings data is not available yet, waiting...');

        await Promise.all([
            new Promise<void>(resolve => {
                if (initializedUser) return resolve();

                const finished = state.user.$onAction(action => {
                    if (action.name === 'markInitialized') {
                        resolve();
                        finished();
                    }
                });
            }),
            new Promise<void>(resolve => {
                if (initializedSettings) return resolve();

                const finished = state.settings.$onAction(action => {
                    if (action.name === 'markInitialized') {
                        resolve();
                        finished();
                    }
                });
            }),
        ]);
    }

    const middlewares = getMiddlewares(globalMiddlewares, to.meta?.middlewares);
    Logger.debug('Router', `Visit ${from.fullPath} -> ${to.fullPath} [middlewares: ${middlewares.map(a => a.name()).join(', ')}]`);

    state.navigation.setCurrentRoute({
        name: to.name ? to.name.toString() : 'unknown',
        icon: to.meta?.icon || 'unknown',
        params: to.params,
        permission: to.meta?.permission,
        feature: to.meta?.feature,
    });
    for(const middleware of middlewares) {
        const res: any = await middleware.run(to, from);
        if (res !== undefined) {
            Logger.debug('Router', `Middleware ${middleware.name()} failed.`);

            state.navigation.setCurrentRoute({
                name: from.name ? from.name.toString() : 'unknown',
                icon: from.meta?.icon || 'unknown',
                params: from.params,
                permission: from.meta?.permission,
                feature: from.meta?.feature,
            });
            return next(res);
        }
    }

    return next();
});

Router.afterEach(async guard => {
    if (guard.matched.length > 0) {
        const routes: RouteData[] = [];

        // We need to find the furthest `showChildrenInNavbar` element to be able to
        // know which children the navbar should show.
        for(let i = guard.matched.length - 1; i >= 0; i--) {
            const match = guard.matched[i];
            if (!match.meta?.showChildrenInNavbar) continue;

            const getRouteData = (child: RouteRecordRaw) => {
                const passthrough = [Passthrough, TabberPassthrough].includes(child.component);
                let realChild: any = child;
                if (passthrough) {
                    realChild = child.children?.[0];
                }

                if (!child.name || !realChild) {
                    Logger.warn('Router', `Route ${child.path || '<blank path>'} is missing required data for navbar.`);
                    return;
                }

                if (child.meta?.hidden) return;
                if (child.meta?.adminOnly && (!state.user.data?.rootAdmin && !state.user.data?.supportOp)) return;

                return {
                    name: realChild.name.toString(),
                    displayName: child.component === TabberPassthrough ? child.name.toString() : realChild.name.toString(),
                    active: passthrough ? guard.name!.toString().startsWith(`${child.name.toString()}.`) : child.name === guard.name,
                    params: getRouteParams(`${match.path}/${child.path}`, guard.params),
                    permission: child.meta?.permission,
                    feature: child.meta?.feature,
                };
            };

            for(const child of match.children) {
                if (child.meta?.showAsCategory) {
                    if (!child.name) {
                        Logger.warn('Router', `Route ${child.path || '<blank path>'} is configured to be shown as category, without a name.`);
                        continue;
                    }

                    if (!child.children) {
                        Logger.warn('Router', `Route ${child.path || '<blank path>'} is configured to be shown as category, without children.`);
                        continue;
                    }

                    const categoryRoutes: RouteData[] = [];
                    child.children.forEach(child => {
                        const routeData = getRouteData(child);
                        if (!routeData) return;

                        categoryRoutes.push(routeData);
                    });

                    routes.push({
                        name: child.name.toString(),
                        displayName: child.name.toString(),
                        active: categoryRoutes.some(a => a.active),
                        permission: child.meta?.permission,
                        feature: child.meta?.feature,

                        routes: categoryRoutes,
                    });
                } else {
                    const routeData = getRouteData(child);
                    if (!routeData) continue;

                    routes.push(routeData);
                }
            }
            break;
        }

        state.navigation.setRoutes(routes);
    }

    const middlewares = getMiddlewares(globalMiddlewares, guard.meta?.middlewares);
    for(const middleware of middlewares) {
        if (middleware.postRun) await middleware.postRun();
    }
});
