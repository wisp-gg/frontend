<template>
    <div>
        <v-form service-id="nests@update">
            <container title="admin.nests.details">
                <div class="grid lg:grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                        <v-input name="name" footer="admin.nests.name_footer" rule="required" :value="nest?.name "/>
                        <v-input label="components.form.fields.identifier" name="shortName" footer="admin.nests.identifier_footer" rule="required" :value="nest?.shortName" />
                        <v-input no-margin label="components.form.fields.description" name="description" :value="nest?.description" />
                    </div>

                    <div>
                        <v-input name="id" footer="admin.nests.id_footer" readonly :value="nest?.name "/>
                        <v-input name="uuid" footer="admin.nests.uuid_footer" readonly :value="nest?.uuid" />
                        <v-input no-margin name="author" readonly :value="nest?.author" />
                    </div>
                </div>

                <div class="text-right mt-4 space-x-4 ">
                    <skeleton :content="4" when="ModelBindings@nest">
                        <delete-nest-modal :nest="nest" />
                    </skeleton>

                    <v-submit color="primary" permission="nest.update">
                        <t path="generic.save" />
                    </v-submit>
                </div>
            </container>
        </v-form>

        <container no-padding class="mt-4" title="admin.nests.eggs">
            <template #actions>
                <v-button color="primary" permission="egg.create" :to="{ name: 'admin.service_management.nests.egg.new' }">
                    <t path="generic.create" />
                </v-button>
            </template>

            <!-- TODO: this isn't ideal as it hides eggs, indicate no perms somehow nicely -->
            <can permission="egg.read">
                <list service-id="eggs@getAll" :fields="listFields">
                    <template #field-name="{ result }">
                        <v-button class="text-white/75" permission="egg.read" :to="{ name: 'admin.service_management.nests.egg.configuration', params: { egg: result.id } }">
                            {{ result.name }}
                        </v-button>
                    </template>
                </list>
            </can>
        </container>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';
import DeleteNestModal from './DeleteNestModal.vue';

export default defineComponent({
    components: { DeleteNestModal },
    setup() {
        return {
            nest: computed(() => state.models.nest),

            listFields: <ListField[]>[
                { key: 'id', features: ['code'], skeleton: 4 },
                { key: 'name', skeleton: 8 },
                { key: 'description', skeleton: 12 },
                { key: 'serversCount', label: 'servers', features: ['code'], skeleton: 4 },
            ]
        };
    }
});
</script>
