<template>
    <modal v-slot="{ close }" title="admin.nests.egg.variables.create_variable" permission="egg_variable.create" opener-color="primary" opener-text="generic.create">
        <v-form service-id="eggVariables@create" :on-success="() => close('success', ['admin.nests.egg.variables.variable_created'])">
            <v-input name="name" rule="required" />
            <v-textarea name="description" rule="required" />

            <div class="grid lg:grid-cols-2 gap-x-4">
                <v-input name="env_variable" rule="required" />
                <v-input name="default_value" />
            </div>

            <div class="grid lg:grid-cols-2 gap-x-4">
                <v-switch name="user_viewable" />
                <v-switch name="user_editable" />
            </div>

            <v-switch name="tickable" />
            <v-input name="rules" />

            <div class="text-right">
                <v-submit color="primary" permission="egg_variable.create">
                    <t path="generic.save" />
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
    },
});
</script>
