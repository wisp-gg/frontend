<template>
    <container :title="['_raw', variable?.name || '']">
        <alerts class="mb-6" :by-key="`server.startup.variable(${variable?.envVariable})`" />

        <div v-if="variable?.tickable" class="flex">
            <v-input class="!w-5 !h-5" name="" permission="startup.update" type="checkbox" :checked="variable?.serverValue === '1'" @change="save" hide-label no-margin />
            <p class="ml-3 font-lg uppercase">
                <t path="generic.enabled" />
            </p>
        </div>

        <v-input v-else name="" permission="startup.update" :value="variable?.serverValue || ''" @keyup="save" hide-label no-margin />

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
import { defineComponent, inject } from 'vue';
import debounce from 'debounce';
import { dispatch } from '~/core';
import { useService } from '~/plugins';
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
            save: debounce((evt: KeyboardEvent) => {
                if (!props.variable?.envVariable) return; // No variable, Skeleton maybe?

                const alertKey = `server.startup.variable(${props.variable?.envVariable})`;
                dispatch('alerts/clear', alertKey);

                const value = props.variable.tickable ? (<HTMLInputElement>evt.target).checked : (<HTMLInputElement> evt.target).value;

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
