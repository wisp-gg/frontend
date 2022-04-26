<template>
    <v-form :service-id="creating ? 'apiKeys@create' : 'apiKeys@update'" :on-success="onSuccess" class="flex flex-col items-start lg:flex-row lg:space-x-4">
        <container title="generic.permissions" class="w-full lg:w-2/3">
            <skeleton :content="32">
                <div class="flex flex-wrap justify-between items-center" v-for="resource of resources" :key="resource">
                    <span><t :path="`generic.${resourceLabel(resource)}`" /></span>
                    <v-radio-group :name="`r_${resourceLabel(resource)}`" prefix="admin.application_api.options" :options="{0:'none',1:'read',3:'read_write'}" :value="apiKey ? apiKey?.[resource] : 0" hide-label />
                </div>
            </skeleton>
        </container>
        <container title="components.form.fields.name" class="w-full mt-4 lg:mt-0 lg:w-2/3">
            <skeleton :content="8">
                <v-input name="memo" :value="apiKey?.memo" hide-label />
            </skeleton>

            <div class="text-right space-x-4 mt-4">
                <v-submit color="primary">
                    <t :path="creating ? 'generic.create' : 'generic.save'" />
                </v-submit>
            </div>
        </container>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { state } from '~/core';
import { ApiKey } from '~/api/models';
import { camelCaseToUnderscore } from '~/helpers';

export default defineComponent({
    setup(props, context) {
        const router = useRouter();
        const route = useRoute();
        const creating = computed(() => route.name === 'admin.administration.application_api.new');

        return {
            creating,
            apiKey: computed(() => state.models.apiKey),
            resources: ApiKey.resources,
            resourceLabel: (resource: string) => camelCaseToUnderscore(resource.substring(1)),

            onSuccess: (apiKey: ApiKey) => {
                if (creating.value) router.push({
                    name: 'admin.administration.application_api.manage',
                    params: {
                        apiKey: apiKey.identifier,
                    }
                });
            }
        };
    },
});
</script>
