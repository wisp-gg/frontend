<template>
    <container title="server.advanced.install_different_edition">
        <p class="flex-grow">
            <t path="server.advanced.install_edition.description" />
        </p>

        <v-form class="mt-3" service-id="advanced@installVersion">
            <skeleton :content="16">
                <v-select
                    name="edition"
                    footer="server.advanced.install_edition.edition_footer"

                    prefix="server.minecraft.editions"
                    :options="editions"
                    v-model:value="selectedEdition"

                    label-prop="name"
                    value-prop="id"
                    searchable
                    rule="required"
                />
            </skeleton>

            <skeleton :content="16">
                <v-select
                    name="version"
                    footer="server.advanced.install_edition.version_footer"

                    :key="selectedEdition"
                    :options="versions"
                    label-prop="name"
                    value-prop="id"
                    :group-label-prop="shouldCategorise ? 'category' : null"
                    :group-options-prop="shouldCategorise ? 'versions' : null"

                    searchable
                    no-translate
                    rule="required"
                />
            </skeleton>

            <v-switch name="format" footer="server.advanced.install_edition.format_footer" />

            <v-submit class="w-full" color="primary" label="server.advanced.install_different_edition" />
        </v-form>
    </container>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useService } from '~/plugins';
import { MinecraftData, Version, CategorizedVersions, VersionLabel } from '~/api/services/client/advanced';

const labelToLocale = {
    [VersionLabel.Unknown]: 'unknown',
    [VersionLabel.Latest]: 'latest',
    [VersionLabel.Recommended]: 'recommended',
};

export default defineComponent({
    setup() {
        const { t } = useI18n();

        const minecraftData = ref<MinecraftData>({
            metadata: {
                show_labels_for: [],
                skip_categories_for: [],
            },
            versions: {},
        });
        const selectedEdition = ref<string>('paper');

        onMounted(async () => {
            // TODO: prefer using minecraft@* service instead for game-specific features
            minecraftData.value = await useService<MinecraftData>('advanced@fetchVersions', true);
        });

        return {
            selectedEdition,

            shouldCategorise: computed(() => !minecraftData.value.metadata.skip_categories_for.includes(selectedEdition.value)),
            editions: computed(() => {
                return Object.keys(minecraftData.value.versions);
            }),
            versions: computed(() => {
                const edition = minecraftData.value.versions[selectedEdition.value];
                if (!edition) return [];

                const metadata = minecraftData.value.metadata;
                if (metadata.show_labels_for.includes(selectedEdition.value)) {
                    return (edition as CategorizedVersions[]).map(categorizedVersion => {
                        return {
                            category: categorizedVersion.category,
                            versions: categorizedVersion.versions.map(version => {
                                version.name = `${version.name} (${t(`generic.labels.${labelToLocale[version.label]}`)})`;

                                return version;
                            }),
                        };
                    });
                }

                const skipCategories = metadata.skip_categories_for.includes(selectedEdition.value);
                if (skipCategories) return (edition as Version[]).map(version => {
                    version.name = `${version.name} (${t(`generic.labels.${labelToLocale[version.label]}`)})`;

                    return version;
                });

                return edition;
            }),
        };
    },
});
</script>
