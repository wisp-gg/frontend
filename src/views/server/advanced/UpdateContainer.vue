<template>
    <container title="server.advanced.update_server">
        <p class="flex-grow">
            <t path="server.advanced.updater.description" />
        </p>

        <v-form service-id="advanced@update" class="mt-4">
            <v-switch name="beta" footer="server.advanced.updater.beta" />

            <v-submit color="warning" permission="updater.update" class="mt-3 w-full">
                <t path="server.advanced.update_server" />
            </v-submit>
        </v-form>
    </container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        return {};
    },
});
</script>
