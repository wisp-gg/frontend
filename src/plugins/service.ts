import { Logger, Router, dispatch } from '~/core';
import * as Services from '~/api/services';
import { TranslatableError } from '~/errors';
import { cleanData } from '~/plugins/clean';

interface ServiceOptions {
    displayErrorsInUI?: boolean | string;
    background?: boolean;
}

function useService<T>(id: string, options: ServiceOptions | boolean | string, ...args: any[]): Promise<T> {
    if (typeof options !== 'object') {
        options = {
            displayErrorsInUI: options,
        };
    }
    const { displayErrorsInUI } = options;

    if (displayErrorsInUI) dispatch('alerts/clear');

    const cleanArgs = args.map(arg => {
        if (typeof arg === 'object') return cleanData(arg);

        return arg;
    });
    Logger.debug('Service', `Calling ${id}`, ...cleanArgs);

    const errorKey = typeof displayErrorsInUI === 'string' ? displayErrorsInUI : undefined;

    const [fullService, method] = id.split('@');
    let [namespace, service] = fullService.split(':');
    if (namespace && !service) { // Guess namespace
        service = namespace;
        namespace = (<string>Router.currentRoute.value.name).split('.')[0] === 'admin' ? 'admin' : 'client';
    }

    const serviceName = `${service.charAt(0).toUpperCase()}${service.slice(1)}Service`;

    const serviceClass = (Services as {[key: string]: any})[namespace]?.[serviceName];
    if (!serviceClass?.[method]) {
        if (displayErrorsInUI) {
            const error = `Failed to get service with ID of '${id}': service ${serviceClass ? `method ${method}` : `class ${serviceName}`} not found?`;
            Logger.error('Service', error);
            dispatch('alerts/add', {
                key: errorKey,

                type: 'danger',
                title: ['generic.something_went_wrong'],
            });

            // TODO: is this really the way to handle this?
            return new Promise((resolve, reject) => reject(error));
        } else throw new Error(`Failed to get service with ID of '${id}': service ${serviceClass ? `method ${method}` : `class ${serviceName}`} not found?`);
    }

    Logger.debug('Service', `Submitting request to ${id}...`);
    const output = serviceClass[method](...args);
    if (output instanceof Promise) {
        return new Promise((resolve, reject) => {
            const promise = (options as ServiceOptions).background ?
                new Promise(resolve => resolve(() => {})) : dispatch('loading/add');

            promise.then(finished => {
                output
                    .then(res => resolve(res))
                    .catch((err: Error) => {
                        if (err instanceof TranslatableError) {
                            if (displayErrorsInUI) dispatch('alerts/add', {
                                key: errorKey,

                                ...err.getDisplayError(),
                            });

                            return reject(err);
                        }

                        console.error(err);

                        Logger.error('Service', `Request ${id} failed:\n${err}`);
                        if (displayErrorsInUI) dispatch('alerts/add', {
                            key: errorKey,

                            type: 'danger',
                            title: ['generic.something_went_wrong'],
                        });

                        reject(err);
                    })
                    .finally(() => {
                        finished();
                    });
            });
        });
    } else {
        return new Promise(resolve => resolve(output));
    }
}

export default useService;

(window as any).useService = useService;
