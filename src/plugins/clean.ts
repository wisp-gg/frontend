import { Logger } from '~/core';

const blacklistedFields = ['token', 'password', 'secret', 'api_key'];
export function cleanData(data: Record<string, any>) {
    if (data instanceof Array) {
        return data;
    }

    const res: {[key: string]: any} = {};
    for (const key in data) {
        if (blacklistedFields.includes(key)) {
            res[key] = '<omitted>';
        } else {
            Logger.debug('Plugins[Clean]', `Cleaning ${key} : ${data[key] instanceof Object}`);

            if (data[key] instanceof Object) {
                res[key] = cleanData(data[key]);
            } else {
                res[key] = data[key];
            }
        }
    }

    return res;
}
