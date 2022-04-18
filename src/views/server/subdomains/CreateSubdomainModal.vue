<template>
    <modal has-alerts title="server.subdomains.create_new" permission="subdomain.create" opener-text="generic.create" v-slot="{ close }">
        <v-form service-id="subdomains@create" :on-success="() => { close(); updateList(); }">
            <v-input name="name" footer="server.subdomains.name_footer" rule="required" />

            <v-select
                name="domain_id"
                label="components.form.fields.domain_name"
                footer="server.subdomains.domain_footer"

                :options="fetchDomains"
                label-prop="name"
                value-prop="id"
                searchable
                rule="required"
            />

            <skeleton :content="16">
                <v-select
                    name="allocation_id"
                    label="components.form.fields.allocation"
                    footer="server.subdomains.allocation_footer"

                    :value="server.primaryAllocation().id"
                    :options="allocations"
                    label-prop="connection"
                    value-prop="id"
                    searchable
                    rule="required"
                />
            </skeleton>

            <div class="text-right space-x-4">
                <v-submit color="primary" permission="subdomain.create" label="generic.submit" />
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { dispatch, state } from '~/core';
import { useService } from '~/plugins';
export default defineComponent({
    setup() {
        return {
            server: computed(() => state.models.server!),

            updateList: () => dispatch('lists/refresh', 'subdomains@getAll'),
            allocations: computed(() => {
                const server = state.models.server!;
                const usedAllocations = state.lists.data['subdomains@getAll']?.results.map(a => a.allocation?.id);

                return server.allocations.filter(a => !usedAllocations.includes(a.id));
            }),

            async fetchDomains() {
                return useService<ListResponse>('subdomains@domains', {
                    displayErrorsInUI: 'server.subdomains.create_new',
                    background: true,
                }).then(a => a.data);
            }
        };
    }
});
</script>
