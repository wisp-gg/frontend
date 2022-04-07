import path from 'path';
import { UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths';
import analyze from 'rollup-plugin-analyzer'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import viteSentry from 'vite-plugin-sentry'

const config: UserConfig = {
    build: {
        assetsDir: 'panel',

        // https://github.com/ikenfin/vite-plugin-sentry
        // https://vitejs.dev/guide/env-and-mode.html#env-variables
        sourcemap: true,

        manifest: true,
        rollupOptions: {
            plugins: [
                analyze({
                    summaryOnly: true,
                    limit: 5,
                }),
            ],
            output: {
                // TODO: come up with "smarter" chunking strategy? currently we have ~70 js files chunked when we could just do it per namespace (one day, https://github.com/rollup/rollup/issues/4180)
                manualChunks: id => {
                    const defaultChunk = undefined; // We can't seem to fallback to a hardcoded chunk :(

                    // Chunk each lang files into its own chunk
                    const prefix = '/src/locales/';
                    const index = id.search(prefix);
                    if (index !== -1) return id.substring(index + prefix.length).split('/').shift();

                //     const prefix = '/src/views/';
                //     const index = id.search(prefix);
                //     if (index !== -1) {
                //         const suffix = id.substring(index + prefix.length);
                //         if (suffix.search('/') === -1) return defaultChunk; // We're not in a namespace
                //
                //         const namespace = suffix.split('/').shift();
                //         if (namespace === 'errors') return defaultChunk;
                //
                //         // If the namespace is server, we want to have separate chunks for file manager (due to ace-editor),
                //         // and console (due to xterm).
                //         if (suffix.startsWith('server/files/')) return 'server-files';
                //         else if (suffix.startsWith('server/Console.vue')) return 'server-console';
                //
                //         // Client index and account settings are part of the same namespace
                //         if (suffix.startsWith('Index.vue') || suffix.startsWith('account/')) return 'client';
                //
                //         return namespace;
                //     }

                    return defaultChunk;
                },
            }
        },
    },
    plugins: [
        vue(),
        vueI18n({
            compositionOnly: true,
            include: ['admin', 'audits', 'client', 'components', 'daemon', 'generic', 'login', 'navigation', 'permissions', 'notifications', 'server']
                        .map(a => path.resolve(`src/locales/*/${a}.json`)),
        }),
        tsconfigPaths({
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.vue'],
        }),
        viteSentry({
            // Only do dry run if RELEASE_VERSION is missing
            dryRun: !process.env.RELEASE_VERSION,

            authToken: process.env.SENTRY_AUTH_TOKEN as string,
            org: process.env.SENTRY_ORG as string,
            project: process.env.SENTRY_PROJECT as string,
            release: process.env.RELEASE_VERSION as string,

            deploy: {
                env: 'production',
            },

            sourceMaps: {
                include: ['./dist/panel'],
                ignore: ['node_modules'],
                urlPrefix: '~/assets/panel',
            },

            setCommits: {
                repo: 'frontend',
                commit: process.env.CI_COMMIT_SHA,
            },
        }),
    ],
    server: {
        host: '0.0.0.0',
        https: true,
    },
    define: {
        // vue-i18n legacy API somehow breaks the egg scripts page with multiple v-editors, but as we don't use this anyways
        // (and don't need this in prod builds), just disable it.
        __VUE_I18N_LEGACY_API__: false,
    },
};

export default config;
