<template>
    <modal v-slot="{ close }" title="admin.nests.egg.update_egg" opener-color="primary" opener-text="generic.import" permission="egg.update">
        <t path="admin.nests.egg.import_update_notice" />

        <v-form class="mt-4" service-id="eggs@importUpdate" :on-success="() => { close('success', ['admin.nests.egg.egg_import_updated']); }">
            <v-file name="import_file" accept="application/json" />

            <div class="text-right">
                <v-submit color="primary" permission="egg.create">
                    <t path="generic.import" />
                </v-submit>
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        return {};
    }
});
</script>
