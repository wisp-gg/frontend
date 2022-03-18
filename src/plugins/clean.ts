const blacklistedFields = ['token', 'password', 'secret', 'api_key'];
const skippedFields = ['asset']; // Known to cause issues (due to deep rooted objects)
export function cleanData(data: Record<string, any>) {
    if (data instanceof Array) {
        return data;
    }

    const res: {[key: string]: any} = {};
    for (const key in data) {
        if (skippedFields.includes(key)) {
            res[key] = data[key];
            continue;
        }

        if (blacklistedFields.includes(key)) {
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
