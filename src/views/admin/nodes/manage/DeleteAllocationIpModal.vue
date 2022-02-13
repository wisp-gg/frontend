<template>
    <modal v-slot="{ close }" title="admin.nodes.allocations.delete_ip_allocations" permission="node_allocation.delete" opener-text="admin.nodes.allocations.delete_ip" opener-color="danger">
        <v-form service-id="nodeAllocations@massDelete" :on-success="() => { close(); updateList(); }">
            <skeleton :content="24">
                <v-select
                    name="ips"
                    label="components.form.fields.ip"
                    mode="tags"
                    taggable
                    rule="required"

                    :options="allocationIps"
                />
            </skeleton>

            <div class="text-right">
                <v-submit color="danger">
                    <t path="generic.delete" />
                </v-submit>
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { dispatch } from '~/core';
import { useService } from '~/plugins';

export default defineComponent({
    setup() {
        const allocationIps = ref<string[]>([]);

        onMounted(() => {
            useService<string[]>('nodeAllocations@ips', 'admin.nodes.allocations.delete_ip_allocations')
                .then((ips) => allocationIps.value = ips);
        });

        return {
            allocationIps,
            updateList: () => dispatch('lists/refresh', 'nodeAllocations@getAll'),
        };
    }
});
</script>
