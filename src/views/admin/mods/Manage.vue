<template>
    <v-form :service-id="creating ? 'mods@create' : 'mods@update'" :on-success="onSuccess" class="grid grid-cols-1 lg:grid-cols-2 items-start gap-x-4 gap-y-4">
        <container title="admin.mods.mod_details">
            <v-input name="name" :value="mod?.name" />
            <v-textarea name="description" :value="mod?.description" />
            <!-- TODO: v-select with existing categories as options + creatable -->
            <v-input name="category" :value="mod?.category" />

            <v-select
                label="components.form.fields.egg"
                name="egg_id"
                rule="required"

                :options="nests"
                label-prop="name"
                value-prop="id"
                group-label-prop="name"
                group-options-prop="eggs"

                :value="mod?.egg.id.toString()"
                searchable
                no-translate
            />

            <v-input no-margin name="version" :value="mod?.version" />
        </container>

        <div>
            <container title="admin.mods.mod_configuration">
                <label class="text-white opacity-50 tracking-wide uppercase block mb-3">
                    <t path="components.form.fields.script_install" />
                </label>

                <skeleton :content="24">
                    <v-editor name="script_install" path="install.sh" height="small" :value="mod?.scriptInstall" />
                </skeleton>

                <label class="text-white opacity-50 tracking-wide uppercase block mb-3">
                    <t path="components.form.fields.script_uninstall" />
                </label>

                <skeleton :content="24">
                    <v-editor name="script_uninstall" path="uninstall.sh" height="small" :value="mod?.scriptUninstall" />
                </skeleton>
            </container>

            <div class="bg-primary-500 p-4 rounded text-right space-x-4 mt-4">
                <skeleton :content="4">
                    <delete-mod-modal v-if="mod" :mod="mod" />
                </skeleton>

                <v-submit color="primary" :permission="creating ? 'mod.create' : 'mod.update'">
                    <t :path="creating ? 'generic.create' : 'generic.save'" />
                </v-submit>
            </div>
        </div>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { state } from '~/core';
import { Mod } from '~/api/models';
import { useService } from '~/plugins';
import DeleteModModal from './DeleteModModal.vue';

export default defineComponent({
    components: { DeleteModModal },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const creating = computed(() => route.name === 'admin.service_management.mods.new');

        return {
            creating,
            nests: (query: string) => {
                return useService<ListResponse>('nests@getAll', true, {
                    ['search']: query,
                }, true).then(data => data.data);
            },
            mod: computed(() => state.models.mod),

            onSuccess: (mod: Mod) => {
                if (creating.value) router.push({
                    name: 'admin.service_management.mods.manage',
                    params: {
                        mod: mod.id
                    }
                });
            }
        };
    }
});
</script>
