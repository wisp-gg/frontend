<template>
    <modal has-alerts title="server.files.rename_or_move">
        <template #opener="{ open }">
            <v-button @click="open" color="secondary" class="flex items-center p-4 text-sm w-full rounded-b-none" :permission="['file.read', 'file.write']">
                <fa class="mr-2" :icon="['fas', 'edit']" size="lg" fixed-width />
                <t path="server.files.rename_or_move" />
            </v-button>
        </template>

        <template #default>
            <v-form service-id="files@renameFile" :on-success="updateList">
                <v-input type="hidden" name="path" :value="path" />

                <v-input name="to" label="components.form.fields.name" rule="required" :value="fullName" />

                <div class="text-right space-x-4">
                    <v-submit color="primary" label="generic.submit" :permission="['file.read', 'file.write']" />
                </div>
            </v-form>
        </template>
    </modal>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import state from '~/state';

export default defineComponent({
    props: {
        path: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    setup(props, context) {
        return {
            updateList: () => state.lists.refresh('files@getDirectory'),
            fullName: computed(() => {
                const path = props.path.split('/');
                path.pop();

                return `${path.join('/')}/${props.name}`;
            }),
        };
    }
});
</script>
