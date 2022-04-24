<template>
    <v-form :service-id="creating ? 'domains@create' : 'domains@update'" :on-success="onSuccess">
        <div class="mb-4" v-if="!creating">
            <alert type="info" icon="info-circle" title="admin.domains.update_notice" />
        </div>

        <container title="admin.domains.domain_details">
            <div>
                <p>
                    <t path="admin.domains.instructions" />
                </p>

                <ol class="list-decimal p-4">
                    <li>
                        <t path="admin.domains.acquire_domain" />
                    </li>
                    <li>
                        <t path="admin.domains.setup_nameservers" />
                    </li>
                </ol>
            </div>

            <v-input class="pt-8" name="name" label="components.form.fields.domain_name" footer="admin.domains.domain_name_footer" :value="domain?.name" rule="required" />

            <div class="grid md:grid-cols-2 gap-x-4">
                <skeleton :content="16">
                    <v-select
                        name="nest_identifiers"
                        footer="admin.domains.nest_identifiers_footer"
                        mode="tags"
                        taggable
                        no-translate

                        :options="domain?.nestIdentifiers"
                        :value="domain?.nestIdentifiers"
                    />
                </skeleton>

                <skeleton :content="16">
                    <v-select
                        name="egg_identifiers"
                        footer="admin.domains.egg_identifiers_footer"
                        mode="tags"
                        taggable
                        no-translate

                        :options="domain?.eggIdentifiers"
                        :value="domain?.eggIdentifiers"
                    />
                </skeleton>
            </div>
        </container>

        <div class="bg-primary-500 p-4 rounded text-right space-x-4 mt-4">
            <skeleton :content="4">
                <delete-domain-modal v-if="domain" :domain="domain" />
            </skeleton>

            <v-submit color="primary" :permission="creating ? 'domain.create' : 'domain.update'">
                <t :path="creating ? 'generic.create' : 'generic.save'" />
            </v-submit>
        </div>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { state } from '~/core';
import { Domain } from '~/api/models';
import DeleteDomainModal from '../DeleteDomainModal.vue';

export default defineComponent({
    components: { DeleteDomainModal },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const creating = computed(() => route.name === 'admin.service_management.domains.new');

        return {
            creating,
            domain: computed(() => state.models.domain),

            onSuccess: (domain: Domain) => {
                if (creating.value) router.push({
                    name: 'admin.service_management.domains.manage.configuration',
                    params: {
                        domain: domain.id,
                    },
                });
            }
        };
    },
});
</script>
