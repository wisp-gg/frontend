import { state, Lang } from '~/core';
import { normalizeNamespaceAndPath } from '~/helpers';

export function permissionsStateLoaded(permission: string | string[]): boolean {
    if (Array.isArray(permission)) {
        return permission.map(permission => permissionsStateLoaded(permission)).every(elem => elem);
    }

    const normalized = normalizeNamespaceAndPath(permission);
    const namespace = normalized.split(':').shift();

    switch(namespace) {
        case 'server':
            return !!state.models.server;
        case 'admin':
            return !!state.user.data;
    }

    return false;
}

// NOTE: The initial page load will not have the required data for this due to how we prefer skeleton loading
// for page contents. Instead, using `computed` should be enough to make the perm state refresh after it is loaded.
export function hasPermissions(permission: string | string[], matchAny = false): boolean {
    if (Array.isArray(permission)) {
        return permission.map(permission => hasPermissions(permission))[matchAny ? 'some' : 'every'](elem => elem);
    }

    const normalized = normalizeNamespaceAndPath(permission);
    const namespace = normalized.split(':').shift();

    switch(namespace) {
        case 'server':
            return state.models.server?.permissions.includes(normalized) || false;
        case 'admin':
            return state.user.data?.permissions.includes(normalized) || false;
    }

    return false;
}

export function translateRequiresPermissions(permissions: string | string[]): string {
    const normalized = (Array.isArray(permissions) ? permissions : [permissions]).map(normalizeNamespaceAndPath);

    // Typings seem to be broken for vue-i18n - it thinks Lang.global is the legacy mode interface instead of the composer one :/
    return (Lang.global.t as any)('generic.requires_permission', {
        permission: normalized
            .map(permission => {
                const [namespace, path] = permission.split(':');

                const tmp = path.split('.');
                tmp.pop();
                const category = tmp.join('.');

                return `${Lang.global.t(`permissions.${namespace}.${category}.title`)} - ${Lang.global.t(`permissions.${namespace}.${path}.title`)}`;
            })
            .map(str => `\`${str}\``)
            .join(', '),
    }, Array.isArray(permissions) ? 2 : 1);
}
