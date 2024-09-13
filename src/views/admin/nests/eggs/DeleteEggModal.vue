<template>
    <modal has-alerts title="admin.nests.egg.delete_egg">
        <template #opener="{ open }">
            <v-button
                @click="open"
                color="danger"
                class="py-3 px-6"
                :tooltip="hasServers ? 'admin.nests.egg.egg_has_servers' : 'generic.delete'"
                :disabled="hasServers"
                permission="egg.delete"
            >
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t :path="['admin.nests.egg.delete_notice', { name: egg.name }]" />

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
import { Egg } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        egg: {
            type: Egg,
            required: true,
        },
    },
    setup(props) {
        const router = useRouter();
        const confirmNameValue = ref<string>();

        return {
            hasServers: (props.egg?.serversCount ?? 0) > 0,

            confirmNameValue,

            canDelete: computed(() => confirmNameValue.value === props.egg.name),

            confirm: () => {
                return useService('eggs@delete', 'admin.nests.egg.delete_egg', {
                    id: props.egg.id
                }).then(() => {
                    router.push({
                        name: 'admin.service_management.nests.manage'
                    });
                });
            }
        };
    }
});
</script>
