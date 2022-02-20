import { App } from 'vue';
import { Router } from 'vue-router';
import * as Sentry from '@sentry/vue';
import { BrowserTracing } from '@sentry/tracing';
import { Logger } from '~/core';

export function enableSentry(app: App, router: Router) {
    Logger.debug('Sentry', 'Enabling itself...');

    // TODO: provide additional metadata, e.g. current version
    Sentry.init({
        app,
        dsn: 'https://f6110e66e1d24661ade5d00d96245ddb@o323313.ingest.sentry.io/6201231',
        integrations: [
            new BrowserTracing({
                routingInstrumentation: Sentry.vueRouterInstrumentation(router),
                tracingOrigins: [`//${location.host}/api/`],
            }),
        ],
        logErrors: true,
        tracesSampleRate: 0.1,
    });
}
