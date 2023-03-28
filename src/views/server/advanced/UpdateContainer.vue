<template>
    <container title="server.advanced.update_server">
        <template #container-header-extra>
            <div class="inline pl-2">
              <fa class="text-white/50 inline" v-tippy="'server.advanced.updater.description'" :icon="['fas', 'circle-info']" size="sm" fixed-width />
            </div>
        </template>

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
