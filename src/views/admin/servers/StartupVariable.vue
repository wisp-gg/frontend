<template>
    <div>
        <skeleton :content="16">
            <v-switch no-margin v-if="variable?.tickable" :label="['_raw', variable.name]" :name="`environment.${variable.envVariable}`" :value="(serverValue ?? variable.defaultValue) === 'true'" />

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
import { defineComponent } from 'vue';
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
});
</script>
