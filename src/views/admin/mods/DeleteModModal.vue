<template>
    <modal has-alerts title="admin.mods.delete_mod">
        <template #opener="{ open }">
            <v-button @click="open" color="danger" permission="mod.delete" class="py-3 px-6" tooltip="generic.delete">
                <fa :icon="['fas', 'trash']" fixed-width size="lg" />
            </v-button>
        </template>

        <template #default>
            <t :path="['admin.mods.delete_notice', { name: mod.name }]" />

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
import { Mod } from '~/api/models';
import { useService } from '~/plugins';
import { useRouter } from 'vue-router';

export default defineComponent({
    props: {
        mod: {
            type: Mod,
            required: true,
        },
    },
    setup(props) {
        const router = useRouter();

        const confirmNameValue = ref<string>();

        return {
            confirmNameValue,

            canDelete: computed(() => confirmNameValue.value === props.mod.name),

            confirm: () => {
                return useService('mods@delete', 'admin.mods.delete_mod', {
                    id: props.mod.id
                }).then(() => {
                    router.push({
                        name: 'admin.service_management.mods.index'
                    });
                });
            }
        };
    }
});
</script>
