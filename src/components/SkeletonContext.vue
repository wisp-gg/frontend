<template>
    <slot />
</template>

<script lang="ts">
import {defineComponent, inject, PropType, provide} from 'vue';

export default defineComponent({
    props: {
        when: {
            type: [String, Array] as PropType<string | string[]>,
            required: true,
        },
    },

    setup(props, context) {
        const parentContext = inject<undefined | (() => string[])>('skeletonContext', undefined);
        const currentContext = [
            ...(parentContext ? parentContext() : []),
            ...(Array.isArray(props.when) ? props.when : [props.when]),
        ];
        provide('skeletonContext', () => currentContext);

        return {};
    }
});
</script>
