import { RouteRecordRaw } from 'vue-router';
import { getRouteParams } from '~/helpers';
import { Logger, Router, Store, Lang, state, dispatch } from '~/core';
import { globalMiddlewares } from '~/routes';
import { RouteData } from '~/store/modules/navigation';
import { Passthrough, TabberPassthrough } from '~/views';

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
    await dispatch('alerts/clear');

    const { user: { initialized: initializedUser }, settings: { initialized: initializedSettings } } = state;
    if (!initializedUser || !initializedSettings) {
        Logger.debug('Router', 'User and/or settings data is not available yet, waiting...');

        await Promise.all([
            new Promise<void>(resolve => {
                if (initializedUser) return resolve();

                const finished = Store.subscribeAction(action => {
                    if (action.type === 'user/markInitialized') {
                        resolve();
                        finished();
                    }
                });
            }),
            new Promise<void>(resolve => {
                if (initializedSettings) return resolve();

                const finished = Store.subscribeAction(action => {
                    if (action.type === 'settings/markInitialized') {
                        resolve();
                        finished();
                    }
                });
            }),
        ]);
    }

    const middlewares = getMiddlewares(globalMiddlewares, to.meta?.middlewares);
    Logger.debug('Router', `Visit ${from.fullPath} -> ${to.fullPath} [middlewares: ${middlewares.map(a => a.name()).join(', ')}]`);

    await dispatch('navigation/setCurrentRoute', {
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

            await dispatch('navigation/setCurrentRoute', {
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
    // TODO: this should be handled somewhere in a different place (e.g. ModelBindings middleware after it has finished retrieving all the data, and just have some reasonable default?)
    // TODO: this should consider the first model binding in the route path (instead of being hardcoded to server, e.g. consider user visiting a node in admin area)
    // TODO: this should also consider (Tabber)Passthrough with separation of admin and client area
    // TODO: Lang.global.t isn't available on first load always due to lang file still loading
    const translatedTitle = `${state.models.server?.name ? `${state.models.server.name} - ` : ''}${Lang.global.t(`navigation.${<string> guard.name}.title`)}`;
    document.title = `${state.settings.data?.branding?.name || 'WISP'} | ${translatedTitle}`;

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

                if (child.redirect) return;

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

        await dispatch('navigation/setRoutes', routes);
    }

    const middlewares = getMiddlewares(globalMiddlewares, guard.meta?.middlewares);
    for(const middleware of middlewares) {
        if (middleware.postRun) await middleware.postRun();
    }
});
