<template>
    <container :title="['_raw', variable?.name || '']">
        <v-form service-id="eggVariables@update" :on-success="onSuccess">
            <v-input type="hidden" name="id" :value="variable?.id" />

            <skeleton :content="12">
                <v-input name="name" rule="required" :value="variable?.name" />
            </skeleton>
            <skeleton :content="12">
                <v-textarea name="description" rule="required" :value="variable?.description" />
            </skeleton>

            <div class="grid lg:grid-cols-2 gap-x-4">
                <skeleton :content="12">
                    <v-input name="env_variable" rule="required" :value="variable?.envVariable" />
                </skeleton>

                <skeleton :content="12">
                    <v-input name="default_value" :value="variable?.defaultValue" />
                </skeleton>
            </div>

            <div class="grid lg:grid-cols-2 gap-x-4">
                <skeleton :content="12">
                    <v-switch name="user_viewable" :value="variable?.userViewable" />
                </skeleton>
                <skeleton :content="12">
                    <v-switch name="user_editable" :value="variable?.userEditable" />
                </skeleton>
            </div>

            <skeleton :content="12">
                <v-switch name="tickable" :value="variable?.tickable" />
            </skeleton>
            <skeleton :content="12">
                <v-input name="rules" :value="variable?.rules" />
            </skeleton>

            <div class="text-right">
                <skeleton :content="4">
                    <v-button class="py-3 px-6 mr-4" permission="egg_variable.delete" @click="deleteVariable" color="danger" tooltip="generic.delete">
                        <fa :icon="['fas', 'trash']" fixed-width size="lg" />
                    </v-button>
                </skeleton>

                <skeleton :content="6">
                    <v-submit color="primary" permission="egg_variable.update">
                        <t path="generic.save" />
                    </v-submit>
                </skeleton>
            </div>
        </v-form>
    </container>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { dispatch, state } from '~/core';
import { EggVariable } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        variable: {
            type: EggVariable,
            required: false,
        },
    },

    setup(props) {
        const updateList = () => dispatch('lists/refresh', 'eggVariables@getAll');

        return {
            egg: computed(() => state.models.egg),

            deleteVariable: () => {
                if (!props.variable) return; // How? skeleton should stop this

                useService('eggVariables@delete', true, { id: props.variable.id }).then(() => {
                    dispatch('alerts/add', {
                        type: 'success',
                        title: ['admin.nests.egg.variables.variable_deleted', { name: props.variable!.name }],
                    });

                    updateList();
                });

                return true;
            },

            onSuccess: async (data: EggVariable) => {
                await updateList();

                dispatch('alerts/add', {
                    type: 'success',
                    title: ['admin.nests.egg.variables.variable_updated', { name: data.name }],
                });
            }
        };
    }
});
</script>
