<template>
    <span v-if="labelInfo" class="ml-2 label" :class="`label-${labelInfo[0]}`">
        <t :path="`admin.migrator.states.${labelInfo[1]}`" />
    </span>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { PanelMigration } from '~/api/models';

export default defineComponent({
    props: {
        migration: {
            type: PanelMigration,
            required: true
        }
    },

    setup(props) {
        return {
            labelInfo: computed(() => {
                if (!props.migration.failed && !props.migration.migratedData) return ['success', 'in_progress'];
                if (props.migration.notifiedUsers) return ['info', 'notified_users'];
                if (props.migration.manual) return ['warning', 'manual'];
                if (props.migration.failed) return ['danger', 'failed'];

                return null;
            }),
        };
    }
});
</script>
