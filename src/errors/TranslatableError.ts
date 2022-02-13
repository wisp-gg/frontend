import { Alert } from '~/store/modules/alerts';

export class TranslatableError extends Error {
    constructor(public title: TranslatableMessage, public messages: TranslatableMessage[] = []) {
        super(`TranslatableError: ${title[0]}`);
    }

    getDisplayError(): Alert {
        return {
            type: 'danger',
            title: this.title,
            messages: this.messages,
        };
    }
}
