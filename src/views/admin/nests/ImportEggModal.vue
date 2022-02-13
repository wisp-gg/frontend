<template>
    <modal v-slot="{ close }" title="admin.nests.import_egg" opener-color="primary" opener-text="admin.nests.import_egg" permission="egg.create">
        <v-form service-id="eggs@import" :on-success="(egg) => { close(); onSuccess(egg); }">
            <v-select
                label="components.form.fields.nest"
                name="nest_id"
                rule="required"

                :options="nests"
                label-prop="name"
                value-prop="id"

                searchable
                no-translate
            />

            <v-file name="import_file" accept="application/json" />

            <div class="text-right">
                <v-submit color="primary" permission="egg.create">
                    <t path="generic.import" />
                </v-submit>
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useService } from '~/plugins';
import { Egg } from '~/api/models';
import { useRouter } from 'vue-router';

export default defineComponent({
    setup() {
        const router = useRouter();

        return {
            nests: (query: string) => {
                return useService<ListResponse>('nests@getAll', true, {
                    ['filter[name]']: query
                }, true).then(data => data.data);
            },

            onSuccess: (egg: Egg) => {
                router.push({
                    name: 'admin.service_management.nests.egg.configuration',
                    params: {
                        nest: egg.nest.getRouteID(),
                        egg: egg.getRouteID()
                    }
                });
            }
        };
    }
});
</script>
