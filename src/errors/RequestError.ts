import { AxiosError } from 'axios';
import Logger from '~/core/logger';
import { cleanData } from '~/plugins/clean';

export class RequestError extends Error {
    constructor(
        private endpoint: string,
        private err: AxiosError,
        private data?: {[key: string]: any} | null,
    ) {
        super(err.message);
    }

    getStatusCode(): any {
        return this.err.response?.status;
    }

    getBody(): string {
        const response = this.err.request?.response;
        if (typeof response === 'string') {
            return response !== '' ? response : '<none>';
        }

        if (['array', 'object'].includes(typeof response)) {
            return JSON.stringify(response) || '<none>';
        }

        Logger.warn('RequestError', `Unknown type ${typeof response} for getting body of response.`);
        return response || '<none>';
    }

    getData(): string {
        return this.data ? JSON.stringify(cleanData(this.data)) : '<none>';
    }

    toString(): string {
        return `${this.message}\nEndpoint: ${this.endpoint}\nData: ${this.getData()}\nBody: ${this.getBody()}`;
    }
}
