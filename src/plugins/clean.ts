const blacklistedFields = ['token', 'password', 'secret', 'api_key'];
export function cleanData(data: Record<string, any>) {
    if (data instanceof Array) {
        return data;
    }

    const res: {[key: string]: any} = {};
    for (const key in data) {
        if (blacklistedFields.map(a => key.indexOf(a)).filter(a => a >= 0).length > 0) {
            res[key] = '<omitted>';
        } else {
            if (data[key] instanceof Object) {
                res[key] = cleanData(data[key]);
            } else {
                res[key] = data[key];
            }
        }
    }

    return res;
}
