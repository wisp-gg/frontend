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
                    <v-input name="path" label="components.form.fields.folder_name" :result-prefix="path + (path.endsWith('/') ? '' : '/')" rule="required" />

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
import state from '~/state';

export default defineComponent({
    props: {
        path: {
            type: String,
        },
    },

    setup() {
        return {
            updateList: () => state.lists.refresh('files@getDirectory'),
        };
    }
});
</script>
