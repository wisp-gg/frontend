<template>
    <slot v-if="!hasFeature" name="no-feature" />
    <slot v-else-if="!hasPermission" name="no-permission" />

    <slot v-else />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { hasPermissions, hasFeatures } from '~/plugins';

export default defineComponent({
    props: {
        feature: {
            type: String,
        },
        anyFeature: {
            type: Boolean,
        },

        permission: {
            type: [String, Array] as unknown as () => string | string[],
        },
        anyPermission: {
            type: Boolean
        },
    },
    setup(props) {
        if (!props.feature && !props.permission) throw new Error('Either feature or permission prop must be supplied to can component');

        return {
            hasFeature: computed(() => props.feature ? hasFeatures(props.feature, props.anyFeature) : true),
            hasPermission: computed(() => props.permission ? hasPermissions(props.permission, props.anyPermission) : true),
        };
    }
});
</script>
