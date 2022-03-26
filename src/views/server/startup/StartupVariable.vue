<template>
    <container :title="['_raw', variable?.name || '']">
        <alerts class="mb-6" :by-key="`server.startup.variable(${variable?.envVariable})`" />

        <skeleton :content="16">
            <v-switch
                v-if="variable?.tickable"
                v-tippy="!variable.userEditable && (isAdmin ? 'server.startup.variable_not_editable_admin': 'server.startup.variable_not_editable')"
                :disabled="!variable?.userEditable"

                name="enabled"
                permission="startup.update"
                :value="variable?.serverValue === '1'"
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
                @keyup="save($event.target.value)"
                hide-label
                no-margin
            />
        </skeleton>

        <p class="mt-3">
            <skeleton :content="12">
                {{ variable.description }}
            </skeleton>
        </p>

        <div class="text-white/75 mt-3">
            <p class="inline-block mr-2">
                <skeleton :content="6">
                    <t path="server.startup.input_rules" />
                </skeleton>
            </p>


            <skeleton :content="12">
                <code class="text-sm mx-1">{{ variable.rules }}</code>
            </skeleton>
        </div>
    </container>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue';
import debounce from 'debounce';
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

        return {
            isAdmin: computed(() => hasPermissions('admin:server_startup.read')),
            save: debounce((value: string | boolean) => {
                if (!props.variable?.envVariable) return; // No variable, Skeleton maybe?

                const alertKey = `server.startup.variable(${props.variable?.envVariable})`;
                dispatch('alerts/clear', alertKey);

                useService<ListResponse>('startup@save', alertKey, {
                    environment: {
                        [props.variable?.envVariable]: value,
                    },
                }).then(data => {
                    updateStartupCommand(data.meta.startupCommand);

                    dispatch('alerts/add', {
                        key: alertKey,
                        timeout: 2500,

                        type: 'success',
                        title: ['server.startup.variable_saved'],
                    });
                });
            }, 300),
        };
    }
});
</script>
