<template>
    <div>
        <skeleton :content="16">
            <v-select
                v-if="inRules.length > 0"
                :name="`environment.${variable.envVariable}`"
                :label="['_raw', variable.name]"
                :options="inRules"
                :value="serverValue ?? variable.defaultValue"
                no-margin
            />

            <v-switch
                v-else-if="variable?.tickable"
                :label="['_raw', variable.name]"
                :name="`environment.${variable.envVariable}`"
                :value="!!Number(serverValue ?? variable?.defaultValue)"
                no-margin
            />

            <v-input
                v-else
                :name="`environment.${variable.envVariable}`"
                :label="['_raw', variable.name]"
                :value="serverValue ?? variable.defaultValue"
                no-margin
            />
        </skeleton>

        <p class="mt-2">
            <skeleton :content="8">
                {{ variable.description }}
            </skeleton>
        </p>

        <div>
            <p class="mt-1">
                <skeleton :content="12">
                    <t path="admin.servers.startup.access_in_startup" /> <code class="text-sm">{{ variable.startupUsage }}</code>
                </skeleton>
            </p>

            <p class="mt-1">
                <skeleton :content="12">
                    <t path="server.startup.input_rules" /> <code class="text-sm">{{ variable.rules }}</code>
                </skeleton>
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { EggVariable } from '~/api/models';

export default defineComponent({
    props: {
        variable: {
            type: EggVariable,
        },
        serverValue: {
            type: String,
        },
    },
    setup(props) {
        const inRules = computed(() => ((props.variable?.rules || '').split('|').find(rule => rule.startsWith('in:')) || '').split(':')[1]?.split(',') || []);
        return {
            inRules,
        };
    },
});
</script>
