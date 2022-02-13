<template>
    <modal title="admin.nests.create_nest" opener-color="primary" opener-text="generic.create" permission="nest.create">
        <v-form service-id="nests@create" :on-success="onSuccess">
            <v-input name="name" footer="admin.nests.name_footer" rule="required" />
            <v-input label="components.form.fields.identifier" name="shortName" footer="admin.nests.identifier_footer" rule="required" />
            <v-input label="components.form.fields.description" name="description" />

            <div class="text-right">
                <v-submit color="primary" permission="nest.create">
                    <t path="generic.create" />
                </v-submit>
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { Nest } from '~/api/models';

export default defineComponent({
    setup() {
        const router = useRouter();

        return {
            onSuccess: (nest: Nest) => {
                router.push({
                    name: 'admin.service_management.nests.manage',
                    params: {
                        nest: nest.id
                    }
                });
            },
        };
    },
});
</script>
