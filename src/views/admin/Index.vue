<template>
    <div>
        <container title="admin.index.instance_overview">
            <i18n-t keypath="admin.index.current_version" tag="h2">
                <template #version>
                    <code>{{ version }}</code>
                </template>
            </i18n-t>

            <can permission="license.read">
                <license-info />
            </can>
        </container>
    </div>
</template>

<style lang="scss" scoped>
ul li::after {
    content: ', ';
}
</style>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import LicenseInfo from './LicenseInfo.vue';

export default defineComponent({
    components: { LicenseInfo },
    setup() {
        return {
            version: computed(() => window.Wisp.Version || 'unknown'),
        };
    }
});
</script>
