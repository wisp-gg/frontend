<template>
    <modal has-alerts title="admin.locations.create_location" permission="location.create" opener-color="primary" opener-text="generic.create">
        <template #default="{ close }">
            <v-form service-id="locations@create" :on-success="() => { close(); updateList(); }">
                <v-input label="components.form.fields.name" name="short" footer="admin.locations.short_footer" rule="required" />
                <v-input label="components.form.fields.description" name="long" footer="admin.locations.long_footer" rule="required" />

                <div class="text-right">
                    <v-submit color="primary" permission="location.create">
                        <t path="generic.create" />
                    </v-submit>
                </div>
            </v-form>
        </template>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dispatch } from '~/core';

export default defineComponent({
    setup() {
        return {
            updateList: () => dispatch('lists/refresh', 'locations@getAll'),
        };
    },
});
</script>
