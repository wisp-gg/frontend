<template>
    <div v-bind="$attrs" v-for="alert of alerts" :key="alert.id">
        <alert
            :type="alert.type"
            :title="alert.title"
            :messages="alert.messages"
            :icon="alert.icon"
        />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';

export default defineComponent({
    inheritAttrs: false, // Hack to cause vue not to cry about "extraneous props (class)", even though they're needed if any alerts were active.

    props: {
        byKey: {
            type: String
        }
    },
    setup(props) {
        return {
            alerts: computed(() => state.alerts.items.filter(a => {
                if (props.byKey) return a.key === props.byKey;

                return !a.key;
            }))
        };
    }
});
</script>
