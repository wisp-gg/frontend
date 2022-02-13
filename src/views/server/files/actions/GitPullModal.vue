<template>
    <modal title="server.files.git_pull" @update:modelValue="onModalChange">
        <template #opener="{ open }">
            <v-button @click="open" color="secondary" permission="file.git" class="flex items-center p-4 text-sm w-full rounded-b-none">
                <fa class="mr-2" :icon="['fab', 'git']" size="lg" fixed-width />
                <t path="server.files.git_pull" />
            </v-button>
        </template>

        <template #default>
            <stepper :steps="2">
                <template #step-1="{ next }">
                    <v-form :service-id="(data) => pull(data, next)" class="flex-grow">
                        <div class="mb-2" v-if="requiresAuth">
                            <alert type="danger" icon="info-circle" :title="['server.files.git_auth_required']" />
                        </div>

                        <t path="server.files.git_pull_description" />

                        <div class="mt-2" v-if="requiresAuth">
                            <v-input type="password" name="access_token" rule="required" no-margin />
                            <a class="text-white text-opacity-50" href="https://github.com/settings/tokens" target="_blank">
                                <t path="server.files.get_access_token_here" />
                            </a>
                        </div>

                        <div class="text-right">
                            <v-submit color="primary" label="generic.submit" permission="file.git" />
                        </div>
                    </v-form>
                </template>

                <template #step-2>
                    <t :path="['server.files.pulled_repository', { commit }]" v-if="pulled" />
                    <t path="generic.something_went_wrong" v-else />
                </template>
            </stepper>
        </template>
    </modal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Logger, dispatch } from '~/core';
import { triggerDaemonAction, useDaemonEvent } from '~/plugins';

export default defineComponent({
    props: {
        path: {
            type: String,
            required: true,
        },
    },

    setup(props, context) {
        const commit = ref('');
        const requiresAuth = ref(false);
        const pulled = ref(false);

        return {
            commit,
            requiresAuth,
            pulled,
            onModalChange: () => {
                if (commit.value) {
                    dispatch('lists/refresh', 'files@getDirectory');
                }

                requiresAuth.value = false;
                pulled.value = false;
            },
            pull: (data: { access_token?: string }, next: () => void): Promise<void> => {
                return new Promise((resolve, reject) => {
                    const unregisterSuccess = useDaemonEvent('git-success', (hash?: string) => {
                        pulled.value = true;
                        if (hash) commit.value = hash;

                        next();
                        finish();
                    });
                    const unregisterError = useDaemonEvent('git-error', err => {
                        if (err.startsWith('Authentication required') || err.startsWith('Remote authentication required')) {
                            requiresAuth.value = true;
                        } else {
                            Logger.error('GitPull', `Failed pulling ${props.path}: ${err}`);

                            next();
                        }

                        finish();
                    });
                    const finish = () => {
                        unregisterSuccess();
                        unregisterError();

                        resolve();
                    };

                    triggerDaemonAction('git-pull', {
                        dir: props.path,
                        authkey: data.access_token,
                    });
                });
            },
        };
    },
});
</script>
