<template>
    <v-form service-id="servers@updateDetails" class="space-y-4">
        <container title="admin.servers.details.server_details">
            <v-input name="name" rule="required" :value="server?.name" />
            <v-input name="external_id" :value="server?.externalId" />
            <v-input name="description" :value="server?.description" />

            <skeleton :content="16">
                <v-model-select
                    service-id="users@getAll"
                    parameter="email"

                    label="components.form.fields.server_owner"
                    name="server_owner_id"
                    label-prop="selectorName"
                    value-prop="id"
                    rule="required"

                    :value="server.user"
                />
            </skeleton>
        </container>

        <div class="bg-primary-500 p-4 rounded text-right">
            <skeleton :content="6">
                <v-submit no-margin color="primary" permission="server.details_update">
                    <t path="generic.submit" />
                </v-submit>
            </skeleton>
        </div>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';

export default defineComponent({
    setup() {
        return {
            server: computed(() => state.models.server!),
        };
    }
});
</script>
