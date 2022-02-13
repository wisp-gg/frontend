<template>
    <modal has-alerts title="admin.servers.delete_server">
        <template #opener="{ open }">
            <v-button @click="open" color="danger" class="py-3 px-6" permission="server.delete" tooltip="generic.delete">
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t :path="['admin.servers.delete_server_notice', { name: server.name }]" />

            <v-form class="mt-4" :service-id="confirm" :can-submit="canDelete">
                <v-input name="confirm_name" v-model:value="confirmationValue" />

                <v-switch name="force" footer="admin.servers.force_footer" />

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
import { Server } from '~/api/models';
import { useService } from '~/plugins';
import { useRouter } from 'vue-router';

export default defineComponent({
    props: {
        server: {
            type: Server,
            required: true,
        },
    },
    setup(props) {
        const router = useRouter();

        const confirmationValue = ref<string>();

        return {
            confirmationValue,

            canDelete: computed(() => confirmationValue.value === props.server.name),

            confirm: (data: { force: boolean }) => {
                return useService('servers@delete', 'admin.servers.delete_server', { force: data.force }).then(() => {
                    router.push({
                        name: 'admin.management.servers.index'
                    });
                });
            }
        };
    }
});
</script>
