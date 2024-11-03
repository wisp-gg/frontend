<template>
    <container :title="['_raw', variable?.name || '']">
        <alerts class="mb-6" :by-key="`server.startup.variable(${variable?.envVariable})`" />

        <skeleton :content="16">
            <v-select
                v-if="inRules.length > 0"
                v-tippy="!variable.userEditable && (isAdmin ? 'server.startup.variable_not_editable_admin': 'server.startup.variable_not_editable')"
                :disabled="!variable?.userEditable"

                name=""
                permission="startup.update"
                :options="inRules"
                :value="variable?.serverValue || ''"
                @update:value="save"
                hide-label
                no-margin
            />

            <v-switch
                v-else-if="variable?.tickable"
                v-tippy="!variable.userEditable && (isAdmin ? 'server.startup.variable_not_editable_admin': 'server.startup.variable_not_editable')"
                :disabled="!variable?.userEditable"

                :label="['_raw', variable?.name]"
                :name="`environment.${variable?.envVariable}`"
                permission="startup.update"
                :value="tickableValue"
                @update:value="save"
                no-margin
            />

            <v-input
                v-else
                v-tippy="!variable.userEditable && (isAdmin ? 'server.startup.variable_not_editable_admin': 'server.startup.variable_not_editable')"
                :disabled="!variable?.userEditable"

                name=""
                permission="startup.update"
                :value="variable?.serverValue || ''"
                @focusout="save($event.target.value)"
                hide-label
                no-margin
            />
        </skeleton>

        <template #container-header-extra>
            <skeleton :content="16">
                <div class="inline pl-2">
                    <fa class="text-white/50 inline" v-tippy="variable.description" :icon="['fas', 'circle-info']" size="sm" fixed-width />
                </div>
            </skeleton>
        </template>
    </container>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue';
import { dispatch } from '~/core';
import { hasPermissions, useService } from '~/plugins';
import { ServerVariable } from '~/api/models';

export default defineComponent({
    props: {
        variable: {
            type: ServerVariable,
        },
    },
    setup(props) {
        const updateStartupCommand = inject<(newCommand: string) => any>('updateStartupCommand');
        if (!updateStartupCommand) throw new Error('Missing required injection updateStartupCommand');

        const inRules = computed(() => ((props.variable?.rules || '').split('|').find(rule => rule.startsWith('in:')) || '').split(':')[1]?.split(',') || []);

        const tickableValue = computed(() => props.variable?.tickable
            ? props.variable.serverValue ? props.variable?.serverValue === '1' : props.variable?.defaultValue === '1'
            : false
        );

        return {
            inRules,
            tickableValue,
            isAdmin: computed(() => hasPermissions('admin:server_startup.read')),
            save: (value: string | boolean) => {
                if (!props.variable?.envVariable) return; // No variable, Skeleton maybe?

                const alertKey = `server.startup.variable(${props.variable?.envVariable})`;
                dispatch('alerts/clear', alertKey);

                useService<ListResponse>('startup@save', alertKey, {
                    environment: {
                        [props.variable?.envVariable]: value,
                    },
                }).then(data => {
                    updateStartupCommand(data.meta.startupCommand);

                    dispatch('lists/set', {
                        serviceId: 'startup@getAll',
                        key: 'results',
                        value: data.data,
                    });
                    dispatch('alerts/add', {
                        key: alertKey,
                        timeout: 2500,

                        type: 'success',
                        title: ['server.startup.variable_saved'],
                    });
                });
            },
        };
    }
});
</script>
