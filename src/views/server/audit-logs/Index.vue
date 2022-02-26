<template>
    <div class="flex items-stretch overflow-x-hidden">
        <list
            service-id="auditLogs@get"
            :class="selectedAudit ? 'audit-log-list' : '!w-full'"
            class="w-full lg:w-1/2 flex flex-col gap-y-2 transition-all transform"
        >
            <template #results="{ results }">
                <template v-if="results.length > 0">
                    <audit-log-row
                        v-for="(result, idx) of results"
                        :key="idx"
                        @click="selectAudit(result)"

                        :audit="result"
                    />
                </template>

                <div v-else>
                    <p>no items</p>
                </div>
            </template>
        </list>

        <div class="w-full lg:w-1/2 lg:ml-4 transition-all transform" :class="selectedAudit ? '' : '!w-0 translate-x-full'">
            <audit-details-container :audit="selectedAudit" @close="closeContainer" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.audit-log-list {
    @media(max-width: 1023px) {
        @apply w-0 -translate-x-full;
    }
}
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { AuditLog } from '~/api/models';
import AuditLogRow from './AuditLogRow.vue';
import AuditDetailsContainer from './AuditDetailsContainer.vue';

export default defineComponent({
    components: { AuditLogRow, AuditDetailsContainer },
    setup() {
        const selectedAudit = ref<AuditLog | undefined>();

        return {
            selectedAudit,

            selectAudit: (audit: AuditLog) => {
                selectedAudit.value = audit;
            },
            closeContainer: () => {
                selectedAudit.value = undefined;
            }
        };
    },
});
</script>
