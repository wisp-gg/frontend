<template>
    <modal has-alerts title="admin.nests.delete_nest">
        <template #opener="{ open }">
            <v-button
                @click="open"
                color="danger"
                class="py-3 px-6"
                :tooltip="hasServers ? 'admin.nests.nest_has_servers' : 'generic.delete'"
                :disabled="hasServers"
                permission="nest.delete"
            >
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t :path="['admin.nests.delete_notice', { name: nest.name }]" />

            <v-form class="mt-4" :service-id="confirm" :can-submit="canDelete">
                <v-input name="confirm_name" v-model:value="confirmNameValue" />

                <div class="text-right">
                    <v-submit color="danger">
                        <t path="generic.delete" />
                    </v-submit>
                </div>
            </v-form>
        </template>
    </modal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Nest } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        nest: {
            type: Nest,
            required: true,
        },
    },
    setup(props) {
        const router = useRouter();
        const confirmNameValue = ref<string>();

        return {
            hasServers: (props.nest.serversCount ?? 0) > 0,

            confirmNameValue,

            canDelete: computed(() => confirmNameValue.value === props.nest.name),

            confirm: () => {
                return useService('nests@delete', 'admin.nests.delete_nest', {
                    id: props.nest.id
                }).then(() => {
                    router.push({
                        name: 'admin.service_management.nests.index'
                    });
                });
            }
        };
    }
});
</script>
