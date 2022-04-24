import axios, { AxiosInstance, Method } from 'axios';
import { camelCaseToUnderscore } from '~/helpers';
import { Logger, Router } from '~/core';
import state from '~/state';
import { TranslatableError, RequestError } from '~/errors';
import { BaseModel } from '~/api/models';

type callbackFn = () => any;
type HTTPMethods = 'get' | 'post' | 'put' | 'delete' | 'head';

class CSRFClass {
    private ran: Promise<any> | undefined;

    initialize(axios: AxiosInstance) {
        if (this.ran) return this.ran;

        Logger.debug('CSRFClass', 'Initializing CSRF...');
        return this.ran = axios.request({
            method: 'GET',
            baseURL: window.Wisp.BaseURL,
            url: '/sanctum/csrf-cookie',
        });
    }
}
const CSRF = new CSRFClass();

export default class RequestService {
    private readonly axios: AxiosInstance;
    private ready = false;
    private queue: callbackFn[] = [];
    private responseCache: Record<string, Promise<any>> = {};
    constructor(private namespace: string) {
        // /auth/@me should be ignored
        this.axios = axios.create({
            baseURL: window.Wisp ? (window.Wisp.BaseURL + `/api/${namespace}`) : undefined,
            timeout: 10000,
            responseType: 'json',
            headers: {
                // TODO: Me
            },
            withCredentials: true,
        });

        if (window.Wisp) {
            CSRF.initialize(this.axios)
                .then(() => {
                    Logger.debug(`RequestService[${namespace}]`, 'Ready to perform requests!');
                    this.ready = true;

                    this.queue.forEach(a => a());
                    this.queue = [];
                })
                .catch(err => {
                    Logger.fatal('RequestService', 'Initializing CSRF failed', err);
                });
        }
    }

    // TODO: What if there's too many requests queued? e.g. due to page loads
    // Timeouts or just discard...?
    private waitForReady(callbackFn: () => any) {
        return new Promise((resolve, reject) => {
            this.queue.push(() => {
                callbackFn()
                    .then(resolve)
                    .catch(reject);
            });
        });
    }

    private injectRouterParameters(data: string) {
        const params = state.navigation.currentRoute.params;

        for(const key in params) {
            const model = state.models[key];
            const value = model?.getRouteID(this.namespace) || params[key] as string;

            data = data.replaceAll(`:${key}`, value);
        }

        return data;
    }

    private request(method: Method, endpoint: string, data?: Record<string, any>, headers?: Record<string, any>): Promise<any> {
        if (!this.ready) return this.waitForReady(() => {
            return this.request(method, endpoint, data);
        });

        endpoint = this.injectRouterParameters(endpoint);

        // Axios delete method requires a more special structure (where data and headers are merged into one for whatever reason)
        // @see https://github.com/axios/axios/issues/897#issuecomment-343715381
        if (method.toLowerCase() === 'delete' && data) data = {
            data,
            headers,
        };

        return this.axios[method.toLowerCase() as HTTPMethods](endpoint, data, headers)
            .then(async res => {
                if (import.meta.env.DEV && import.meta.env.VITE_HTTP_DELAY) {
                    await new Promise(resolve => setTimeout(resolve, import.meta.env.VITE_HTTP_DELAY));
                }

                // If res.data is empty, it can be caused by e.g. malformed JSON response
                if (res.status >= 200 && res.status < 300 && res.status !== 204 && !res.data) {
                    throw new Error('Received malformed JSON or status code isn\'t 204...?');
                }

                if (res.data?.errors && res.data?.errors.length > 0) {
                    const errors = res.data.errors;
                    if (errors.length > 1) { // If we receive multiple errors, chances are this is a validation response
                        // TODO: these errors should be translated
                        throw new TranslatableError(['components.form.validation_error'], errors);
                    } else { // Otherwise, its a DisplayApiException
                        const { code, data } = errors.shift();
                        throw new TranslatableError([code, data]);
                    }
                }

                return res.data;
            })
            .catch(err => {
                if (err instanceof TranslatableError) {
                    throw err;
                }

                const refresh = () => {
                    const lastRefresh = parseInt(localStorage.getItem('last_refresh') || '');
                    if (!isNaN(lastRefresh)) {
                        const date = new Date(lastRefresh);

                        // If the last refresh was inside a minute, do not reload due to possible infinite refresh loop
                        if (new Date().getTime() - date.getTime() < 60 * 1000) return;
                    }

                    Logger.debug('RequestService', 'Refreshing the page...');
                    localStorage.setItem('last_refresh', new Date().getTime().toString());
                    location.reload();
                };

                switch(err.response?.status) {
                    case 301:
                    case 302:
                        // Assume if the backend redirects us it means the user is already authenticated.
                        refresh();
                        break;
                    case 400:
                    case 422:
                        // TODO: this could be smarter - detect which field caused the error
                        const errors: any[] = err.response?.data?.errors;
                        if (errors) {
                            throw new TranslatableError(
                                ['components.form.validation_error', errors.length],
                                errors
                                    .filter(error => error.detail)
                                    .map(error => {
                                        return ['_raw', error.detail];
                                    })
                            );
                        }
                        break;
                    case 401:
                        // TODO: this should be re-evaluated, if the session becomes invalid it'll be met with 401 (incl. settings endpoint => please refresh page)
                        // We can't refresh here because it'll trigger an infinite loop (unless @me endpoint gets whitelisted).
                        // Though I don't think this is really needed either.
                        // refresh();
                        break;
                    case 403:
                        // TODO: display that no perms (although this should never realistically happen)
                        break;
                    case 404:
                        Router.push({
                            name: '404',
                            params: {
                                catchAll: location.pathname.substring(1),
                            },
                            query: Router.currentRoute.value.query,
                            hash: Router.currentRoute.value.hash,
                        });
                        break;
                    case 419:
                        refresh();
                        break;
                    case 429:
                        throw new TranslatableError(['navigation.errors.429']);
                }

                throw new RequestError(method, endpoint, err);
            });
    }

    get(endpoint: string, data?: Record<string, any>, headers?: Record<string, any>) {
        return this.request('GET', `${endpoint}${data ? `?${this.toQuery(data)}` : ''}`, headers);
    }

    getCached(cacheKey: string, endpoint: string, data?: Record<string, any>, headers?: Record<string, any>): Promise<any> {
        cacheKey = this.injectRouterParameters(cacheKey);
        if (data) {
            cacheKey += `?${JSON.stringify(data)}`; // Although not correct way, it's the lazy:tm: way
        }

        if (cacheKey in this.responseCache) {
            Logger.debug('RequestService', `Trying to refetch ${cacheKey}, using local cache instead...`);

            return this.responseCache[cacheKey];
        }

        return this.responseCache[cacheKey] = new Promise((resolve, reject) => {
            this.get(endpoint, data, headers)
                .then(resolve)
                .catch(err => {
                    delete this.responseCache[cacheKey];

                    reject(err);
                });
        });
    }

    post(endpoint: string, data?: Record<string, any>, headers?: Record<string, any>) {
        return this.request('POST', endpoint, data, headers);
    }

    patch(endpoint: string, data?: Record<string, any>, headers?: Record<string, any>) {
        return this.request('PATCH', endpoint, data, headers);
    }

    put(endpoint: string, data?: Record<string, any>, headers?: Record<string, any>) {
        return this.request('PUT', endpoint, data, headers);
    }

    delete(endpoint: string, data?: Record<string, any>, headers?: Record<string, any>) {
        return this.request('DELETE', endpoint, data, headers);
    }

    toQuery(data: {[key: string]: string | number | Record<string, any>}) {
        const res = [];

        for(const key in data) {
            const convertedKey = camelCaseToUnderscore(key);

            const value = data[key];
            if (value == undefined) {
                continue;
            }

            if (Array.isArray(value)) {
                Object.values(value).forEach(v => {
                    res.push(`${convertedKey}[]=${encodeURIComponent(v)}`);
                });
            } else if (typeof value === 'object') {
                // TODO: me
                throw new Error('toQuery method currently does not support key-value pairs');
            } else {
                res.push(`${convertedKey}=${encodeURIComponent(value)}`);
            }
        }

        return res.join('&');
    }

    // Technically doesn't belong here, but it should be available as an easy helper method
    // TODO: consider handling this automatically in patch/put instead?
    updateModelBinding<T extends BaseModel>(model: T): T {
        state.models.update({
            name: model.getRouteName() as any,
            model: model.getAttributes(),
        });

        return model;
    }
}
