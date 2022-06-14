<template>
    <div class="flex flex-col items-start lg:flex-row lg:gap-x-6">
        <container class="w-full lg:w-2/3" no-padding title="server.allocations.available_allocations">
            <list service-id="allocations@getAll" :fields="listFields">
                <template #headers-after>
                    <th />
                </template>

                <template #fields-after="{ result }">
                    <td class="p-6 text-right">
                        <skeleton :content="8">
                            <p v-if="result.primary" class="text-success">
                                <t path="server.allocations.primary" />
                            </p>

                            <v-button v-else color="primary" permission="allocation.update" @click="makePrimary(result.id)" spinner>
                                <t path="server.allocations.make_primary" />
                            </v-button>
                        </skeleton>
                    </td>
                </template>
            </list>
        </container>

        <container class="w-full lg:w-1/3" title="server.allocations.help_title">
            <p>
                <t path="server.allocations.help_description" />
            </p>
        </container>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useService } from '~/plugins';
import { dispatch } from '~/core';

export default defineComponent({
    setup() {
        return {
            makePrimary: (id: number) => useService('allocations@update', true, {
                id,
                primary: true
            }).then(() => dispatch('lists/refresh', 'allocations@getAll')),

            listFields: <ListField[]>[
                { key: 'ip', features: ['code', 'clipboard'], skeleton: 12 },
                { key: 'port', features: ['code'], skeleton: 4 },
            ],
        };
    },
});
</script>
