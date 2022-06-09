<template>
    <modal v-slot="{ close }" title="server.modpacks.install_modpack" permission="modpack.update" opener-color="primary" opener-text="generic.install">
        <i18n-t keypath="server.modpacks.install_warning" tag="h2">
            <template #modpack>
                <skeleton :content="10">
                    <span class="font-semibold">{{ modpack?.name }}</span>
                </skeleton>
            </template>
        </i18n-t>

        <v-form service-id="modpacks@install" class="mt-2" :on-success="() => { close(); onSuccess(); }">
            <v-input type="hidden" name="modpack_id" :value="modpack?.id?.toString()" />

            <v-select
                name="version_id"
                label="components.form.fields.version"

                :options="versions"
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
import { defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { dispatch } from '~/core';
import { Modpack, ModpackVersion } from '~/api/models';

const releaseTypes = {
    [ModpackVersion.Release]: 'release',
    [ModpackVersion.Beta]: 'beta',
    [ModpackVersion.Alpha]: 'alpha',
};

export default defineComponent({
    props: {
        modpack: {
            type: Modpack,
            required: true,
        },
    },
    setup(props) {
        const { t } = useI18n();

        return {
            versions: computed(() => props.modpack?.versions?.map(version => {
                let name = version.name;
                if (releaseTypes[version.releaseType]) {
                    name += ` (${t(`generic.release_types.${releaseTypes[version.releaseType]}`)})`;
                }

                return {
                    name,
                    id: version.versionId,
                };
            })),
            listFields: <ListField[]>[
                { key: 'name', skeleton: 8 },
                { key: 'description', skeleton: 16 },
                { key: 'downloads', format: 'number', skeleton: 8 },
            ],
            onSuccess: () => {
                dispatch('alerts/add', {
                    type: 'success',
                    title: ['server.modpacks.installing'],
                });
            },
        };
    },
});
</script>
