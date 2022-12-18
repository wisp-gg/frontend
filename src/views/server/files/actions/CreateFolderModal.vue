<template>
    <modal has-alerts title="server.files.new_folder">
        <template #opener="{ open }">
            <v-button color="secondary" permission="file.write" @click="open" class="flex items-center p-4 text-sm w-full rounded-none">
                <fa class="mr-2" :icon="['fas', 'folder']" size="lg" fixed-width />
                <t path="server.files.new_folder" />
            </v-button>
        </template>

        <template #default="{ close }">
            <div class="flex items-center">
                <v-form service-id="files@createDirectory" :on-success="() => { close(); updateList(); }" class="flex-grow">
                    <v-input type="hidden" name="root" rule="required" :value="path" />
                    <v-input name="name" label="components.form.fields.folder_name" rule="required" />

                    <div class="text-right">
                        <v-submit color="primary" label="generic.create" permission="file.write" />
                    </div>
                </v-form>
            </div>
        </template>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dispatch } from '~/core';

export default defineComponent({
    props: {
        path: {
            type: String,
        },
    },

    setup() {
        return {
            updateList: () => dispatch('lists/refresh', 'files@getDirectory'),
        };
    }
});
</script>
