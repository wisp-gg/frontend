<template>
    <div>
        <div class="bg-primary-500 p-4 rounded text-right space-x-4 mb-4">
            <create-variable-modal />
        </div>

        <list service-id="eggVariables@getAll" :skeletons="6">
            <template #results="{ results }">
                <div class="grid lg:grid-cols-2 gap-x-4 gap-y-4">
                    <egg-variable v-for="(result, idx) of results" :key="idx" :variable="result" />
                </div>
            </template>
        </list>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';
import CreateVariableModal from './CreateVariableModal.vue';
import EggVariable from './EggVariable.vue';

export default defineComponent({
    components: { CreateVariableModal, EggVariable },
    setup() {
        return {
            egg: computed(() => state.models.egg),
        };
    }
});
</script>
