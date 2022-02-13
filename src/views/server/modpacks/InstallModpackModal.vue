<template>
    <modal title="server.modpacks.install_modpack" permission="modpack.update" opener-color="primary" opener-text="generic.install">
        <i18n-t keypath="server.modpacks.install_warning" tag="h2">
            <template #modpack>
                <skeleton :content="10">
                    <span class="font-semibold">{{ modpack?.name }}</span>
                </skeleton>
            </template>
        </i18n-t>

        <v-form service-id="modpacks@install" class="mt-2">
            <v-input type="hidden" name="modpack" :value="modpack?.id?.toString()" />

            <v-select
                name="version"

                :options="fetchVersions"
                label-prop="name"
                value-prop="id"
                searchable
                rule="required"
            />

            <v-switch name="format" footer="server.modpacks.format_footer" />

            <div class="text-right">
                <v-submit no-margin color="primary" permission="modpack.update">
                    <t path="generic.install" />
                </v-submit>
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Modpack } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        modpack: {
            type: Modpack,
            required: true,
        },
    },
    setup(props) {
        return {
            async fetchVersions() {
                return useService('modpacks@versions', {
                    displayErrorsInUI: 'server.modpacks.install_modpack',
                    background: true,
                }, {
                    modpack: props.modpack.id,
                });
            },

            listFields: <ListField[]>[
                { key: 'name', skeleton: 8 },
                { key: 'description', skeleton: 16 },
                { key: 'downloads', format: 'number', skeleton: 8 },
            ],
        };
    },
});
</script>
