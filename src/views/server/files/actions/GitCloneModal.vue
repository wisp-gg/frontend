<template>
    <modal title="server.files.git_clone" @update:modelValue="onModalChange">
        <template #opener="{ open }">
            <v-button @click="open" color="secondary" permission="file.git" class="flex items-center p-4 text-sm w-full rounded-b-none">
                <fa class="mr-2" :icon="['fab', 'git']" size="lg" fixed-width />
                <t path="server.files.git_clone" />
            </v-button>
        </template>

        <template #default>
            <stepper :steps="2">
                <template #step-1="{ next }">
                    <v-form :service-id="(data) => clone(data, next)" class="flex-grow">
                        <div class="mb-2" v-if="requiresAuth">
                            <alert type="danger" icon="info-circle" :title="['server.files.git_auth_required']" />
                        </div>

                        <!-- TODO: instead of this regex, prefer a rule e.g. `ends_with:.git` instead? -->
                        <v-input name="repository" rule="required|regex:^((http(s)?))(:(\/\/)?)([\w\.@\:/\-~]+)(\.git)$" />
                        <v-input name="branch" rule="required" />
                        <div v-if="requiresAuth">
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
                    <t :path="['server.files.cloned_repository', { path, repository }]" v-if="cloned" />
                    <t path="generic.something_went_wrong" v-else />
                </template>
            </stepper>
        </template>
    </modal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { dispatch } from '~/core';
import { useDaemonEvent, triggerDaemonAction } from '~/plugins';
import Logger from '~/core/logger';

export default defineComponent({
    props: {
        path: {
            type: String,
            required: true,
        },
    },

    setup(props, context) {
        const repository = ref('');
        const requiresAuth = ref(false);
        const cloned = ref(false);

        return {
            repository,
            requiresAuth,
            cloned,
            onModalChange: () => {
                if (cloned.value) {
                    dispatch('lists/refresh', 'files@getDirectory');
                }

                requiresAuth.value = false;
                cloned.value = false;
            },
            clone: (data: { repository: string, branch: string, access_token?: string }, next: () => void): Promise<void> => {
                repository.value = data.repository;
                return new Promise((resolve, reject) => {
                    const unregisterSuccess = useDaemonEvent('git-success', () => {
                        cloned.value = true;

                        next();
                        finish();
                    });
                    const unregisterError = useDaemonEvent('git-error', err => {
                        if (err.startsWith('Authentication required') || err.startsWith('Remote authentication required')) {
                            requiresAuth.value = true;
                        } else {
                            Logger.error('GitClone', `Failed cloning ${data.repository}: ${err}`);

                            next();
                        }

                        finish();
                    });
                    const finish = () => {
                        unregisterSuccess();
                        unregisterError();

                        resolve();
                    };

                    triggerDaemonAction('git-clone', {
                        dir: props.path,
                        url: data.repository,
                        branch: data.branch,
                        authkey: data.access_token,
                    });
                });
            },
        };
    },
});
</script>
