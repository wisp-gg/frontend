import { normalizeNamespaceAndPath } from '~/helpers';
import state from '~/state';

export function featuresStateLoaded(feature: string | string[]): boolean {
    if (Array.isArray(feature)) {
        return feature.map(feature => featuresStateLoaded(feature)).every(elem => elem);
    }

    const normalized = normalizeNamespaceAndPath(feature);
    const namespace = normalized.split(':').shift();

    switch(namespace) {
        case 'server':
            return !!state.models.server;
        case 'admin':
            return !!state.settings.data;
    }

    return false;
}

// NOTE: The initial page load will not have the required data for this due to how we prefer skeleton loading
// for page contents. Instead, using `computed` should be enough to make the feature state refresh after it is loaded.
export function hasFeatures(feature: string | string[], matchAny = false): boolean {
    if (Array.isArray(feature)) {
        return feature.map(feature => hasFeatures(feature))[matchAny ? 'some' : 'every'](elem => elem);
    }

    const normalized = normalizeNamespaceAndPath(feature);
    const namespace = normalized.split(':').shift();

    switch(namespace) {
        case 'server':
            return state.models.server?.features.isAvailable(normalized) || false;
        case 'admin':
        case 'general':
            return state.settings.data?.features[normalized]?.available || false;
    }

    return false;
}
