<template>
    <div>
        <v-form service-id="locations@update" class="flex flex-col items-start lg:flex-row lg:space-x-4">
            <container class="w-full lg:w-1/2" title="admin.locations.location_details">
                <v-input label="components.form.fields.name" name="short" footer="admin.locations.short_footer" rule="required" :value="location?.short" />
                <v-input label="components.form.fields.description" name="long" footer="admin.locations.long_footer" rule="required" :value="location?.long" />
            </container>

            <div class="w-full lg:w-1/2">
                <container no-padding class="mb-4" title="admin.locations.nodes">
                    <list :service-id="location?.nodes || []" :fields="listFields">
                        <template #field-name="{ result }">
                            <v-button :to="{ name: 'admin.management.nodes.manage.about', params: { node: result.id } }" permission="node.read" class="text-white/75">
                                {{ result.name }}
                            </v-button>
                        </template>

                        <template #field-fqdn="{ result }">
                            <code v-clipboard="result.connection.fqdn">
                                {{ result.connection.fqdn }}
                            </code>
                        </template>
                    </list>
                </container>

                <div class="bg-primary-500 p-4 rounded text-right space-x-4">
                    <skeleton :content="4">
                        <delete-location-modal :location="location" />
                    </skeleton>

                    <skeleton :content="8">
                        <v-submit no-margin color="primary" permission="location.update">
                            <t path="generic.save" />
                        </v-submit>
                    </skeleton>
                </div>
            </div>
        </v-form>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import DeleteLocationModal from './DeleteLocationModal.vue';
import state from '~/state';

export default defineComponent({
    components: { DeleteLocationModal },
    setup() {
        return {
            location: computed(() => state.models.location),

            listFields: <ListField[]>[
                { key: 'id', features: ['code'], skeleton: 4 },
                { key: 'name', skeleton: 8 },
                { key: 'fqdn', skeleton: 12 },
            ],
        };
    },
});
</script>
