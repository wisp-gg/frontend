<template>
    <modal has-alerts title="admin.nodes.delete_node">
        <template #opener="{ open }">
            <v-button @click="open" color="danger" class="py-3 px-6" permission="node.delete" :tooltip="tooltip" :disabled="disabled">
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t :path="['admin.nodes.delete_notice', { name: node.name }]" />

            <v-form class="mt-4" :service-id="confirm" :can-submit="canDelete">
                <v-input name="confirm_name" v-model:value="confirmationValue" />

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
import { Node } from '~/api/models';
import { useService } from '~/plugins';
import { useRouter } from 'vue-router';

export default defineComponent({
    props: {
        node: {
            type: Node,
            required: true,
        },
    },
    setup(props) {
        const router = useRouter();

        const confirmationValue = ref<string>();

        return {
            confirmationValue,

            canDelete: computed(() => confirmationValue.value === props.node.name),

            tooltip: computed(() => {
                if (props.node.serversCount! > 0) return 'admin.nodes.cant_delete_attached_servers';

                return 'generic.delete';
            }),
            disabled: computed(() => {
                return props.node.serversCount! > 0;
            }),

            confirm: () => {
                return useService('nodes@delete', 'admin.nodes.delete_node').then(() => {
                    router.push({
                        name: 'admin.management.nodes.index'
                    });
                });
            }
        };
    }
});
</script>
