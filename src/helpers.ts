import state from '~/state';

export function bytesToString(bytes: number): [number, string] {
    if (bytes === 0) return [0, 'bytes'];

    const k = 1024;
    const sizes = ['bytes', 'kilobytes', 'megabytes', 'gigabytes', 'terabytes'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return [parseFloat((bytes / Math.pow(k, i)).toFixed(1)), sizes[i]];
}

// A naive implementation to filter out any bad (= no reason to have) parameters for that specific route. Ideally,
// this should consider the full path somehow, but I can't be bothered to figure that out right now :/
export function getRouteParams(path: string, routeParams: Record<string, any>) {
    const params: Record<string, string | string[]> = {};
    for(const key in routeParams) {
        if (path.indexOf(`:${key}`) === -1) continue;

        params[key] = routeParams[key];
    }

    return params;
}

export function normalizeNamespaceAndPath(data: string): string {
    if (data.includes(':')) return data;

    return `${state.navigation.currentRoute.name?.split('.').shift()}:${data}`;
}

export function underscoreToCamelCase(value: string): string {
    let key = '';
    let capitalize = false;
    for(const char of value) {
        if (char === '_') capitalize = true;
        else {
            key += capitalize ? char.toUpperCase() : char;
            capitalize = false;
        }
    }

    return key;
}

export function convertDataToCamelCase(data: Record<string, any>): any {
    if (Array.isArray(data)) return data;

    const res: Record<string, any> = {};
    for (const key in data) {
        res[underscoreToCamelCase(key)] =
            data[key] instanceof Object ? convertDataToCamelCase(data[key]) : data[key];
    }

    return res;
}

export function camelCaseToUnderscore(value: string): string {
    let key = '';
    for(const char of value) {
        if (key === '') {
            key += char.toLowerCase();
            continue;
        }

        key += char === char.toUpperCase() && /^[a-zA-Z0-9]+$/.test(char) ? `_${char.toLowerCase()}` : char;
    }

    return key;
}

export function convertDataToUnderscore(data: Record<string, any>): any {
    if (Array.isArray(data)) return data;

    const res: Record<string, any> = {};
    for (const key in data) {
        res[camelCaseToUnderscore(key)] =
            data[key] instanceof Object ? convertDataToUnderscore(data[key]) : data[key];
    }

    return res;
}
