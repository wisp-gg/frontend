<template>
    <list service-id="plugins@get" :fields="listFields" searchable>
        <template #headers-after>
            <th />
        </template>

        <template #field-name="{ result }">
            <div class="flex items-center">
                <img :src="result.iconUrl" class="w-16 mr-4">
                <p>{{ result.name }}</p>
            </div>
        </template>

        <template #fields-after="{ result }">
            <td class="p-6 text-right">
                <div class="space-x-4">
                    <skeleton :content="12">
                        <code v-if="result.premium">
                            <t path="server.plugins.premium" />
                        </code>

                        <code v-else-if="result.external">
                            <t path="server.plugins.external" />
                        </code>

                        <v-button v-else permission="plugin.update" color="primary" @click="installPlugin(result)" spinner>
                            <t path="generic.install" />
                        </v-button>
                    </skeleton>
                </div>
            </td>
        </template>
    </list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useService } from '~/plugins';
import { Plugin } from '~/api/models';
import { dispatch } from '~/core';

export default defineComponent({
    setup() {
        return {
            installPlugin: (plugin: Plugin) => useService('plugins@install', true, {
                plugin_id: plugin.id,
            }).then(() => {
                dispatch('alerts/add', {
                    type: 'success',
                    title: ['server.plugins.plugin_installed', {
                        name: plugin.name,
                    }],
                });
            }),

            listFields: <ListField[]>[
                { key: 'name', skeleton: 8 },
                { key: 'description', skeleton: 16 },
                { key: 'downloads', format: 'number', skeleton: 4 },
            ],
        };
    },
});
</script>
