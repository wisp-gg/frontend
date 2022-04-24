<template>
    <modal has-alerts title="admin.locations.delete_location">
        <template #opener="{ open }">
            <v-button
                @click="open"
                color="danger"
                class="py-3 px-6"
                :tooltip="hasNodes ? 'admin.locations.location_has_nodes' : 'generic.delete'"
                :disabled="hasNodes"
                permission="location.delete"
            >
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t :path="['admin.locations.delete_notice', { short: location.short }]" />

            <v-form class="mt-4" :service-id="confirm" :can-submit="canDelete">
                <v-input name="confirm_name" v-model:value="confirmNameValue" />

                <div class="text-right">
                    <v-submit color="danger">
                        <t path="generic.delete" />
                    </v-submit>
                </div>
            </v-form>
        </template>
    </modal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import state from '~/state';
import { Location } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        location: {
            type: Location,
            required: true,
        },
    },
    setup(props) {
        const confirmNameValue = ref<string>();

        return {
            hasNodes: (props.location.nodesCount !== undefined ? props.location.nodesCount : props.location.nodes.length) > 0,

            confirmNameValue,

            canDelete: computed(() => confirmNameValue.value === props.location.short),

            confirm: () => {
                return useService('locations@delete', 'admin.locations.delete_location', {
                    id: props.location.id
                }).then(() => state.lists.refresh('locations@getAll'));
            }
        };
    }
});
</script>
