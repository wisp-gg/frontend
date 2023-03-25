<template>
    <list service-id="domains@getAll" :fields="listFields" searchable>
        <template #search-extra>
            <div class="ml-4 flex items-center">
                <v-button color="primary" permission="domain.create" :to="{ name: 'admin.service_management.domains.new' }">
                    <t path="generic.create" />
                </v-button>
            </div>
        </template>
        
        <template #no-items-extra>
          <div class="pt-2">
                <v-button color="primary" permission="domain.create" :to="{ name: 'admin.service_management.domains.new' }">
                    <t path="generic.create" />
                </v-button>
            </div>
        </template>

        <template #headers-after>
            <th />
        </template>

        <template #field-name="{ result }">
            <v-button permission="domain.read" :to="{ name: 'admin.service_management.domains.manage.configuration', params: { domain: result.id } }" class="text-white/75">
                {{ result.name }}
            </v-button>
        </template>

        <template #fields-after="{ result } ">
            <td class="p-6 text-right space-x-4">
                <skeleton :content="8">
                    <v-button permission="domain.read" :to="{ name: 'admin.service_management.domains.manage.configuration', params: { domain: result.id } }" color="primary">
                        <t path="generic.manage" />
                    </v-button>
                </skeleton>

                <skeleton :content="4">
                    <delete-domain-modal :domain="result" />
                </skeleton>
            </td>
        </template>
    </list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DeleteDomainModal from './DeleteDomainModal.vue';

export default defineComponent({
    components: { DeleteDomainModal },
    setup(props, context) {
        return {
            listFields: <ListField[]>[
                { key: 'id', skeleton: 3, features: ['code'] },
                { label: 'domain_name', key: 'name', skeleton: 10 },
                { label: 'servers', key: 'serversCount', features: ['code'], skeleton: 4 },
            ],
        };
    }
});
</script>
