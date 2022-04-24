<template>
    <modal title="server.backups.create_new" opener-text="generic.create" permission="backup.create" v-slot="{ close }">
        <alert type="warning" icon="info-circle" :title="['server.backups.create_warning']" />

        <v-form service-id="backups@create" :on-success="data => { close('success', ['server.backups.created', { name: data.name }]); updateList(); }" class="pt-2">
            <v-input name="name" rule="required" />

            <div class="text-right space-x-4">
                <v-submit color="primary" label="generic.submit" permission="backup.create" />
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import state from '~/state';

export default defineComponent({
    setup(props, context) {
        return {
            updateList: () => state.lists.refresh('backups@getAll'),
        };
    },
});
</script>
