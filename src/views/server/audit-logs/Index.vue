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
                        @click="selectAudit(result, idx)"
                        :selected="selectedAudit?.[1] === idx"

                        :audit="result"
                    />
                </template>

                <div v-else class="flex flex-col lg:flex-row justify-center items-center my-8">
                    <img class="w-2/3 lg:w-1/3" :src="notFound" />

                    <div class="text-center gap-y-8 mt-4 lg:mt-0 lg:ml-4 lg:text-left">
                        <h1 class="text-2xl text-white/75">
                            <t path="server.audit_logs.no_audits" />
                        </h1>

                        <p>
                            <t path="server.audit_logs.no_audits_description" />
                        </p>
                    </div>
                </div>
            </template>
        </list>

        <div class="w-full lg:w-1/2 lg:ml-4 transition-all transform" :class="selectedAudit ? '' : '!w-0 translate-x-full'">
            <audit-details-container :audit="selectedAudit?.[0]" @close="closeContainer" />
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
import notFound from '~/assets/svg/undraw/not_found.svg';

export default defineComponent({
    components: { AuditLogRow, AuditDetailsContainer },
    setup() {
        const selectedAudit = ref<[AuditLog, number] | undefined>();

        return {
            selectedAudit,
            notFound,

            selectAudit: (audit: AuditLog, idx: number) => {
                selectedAudit.value = [audit, idx];
            },
            closeContainer: () => {
                selectedAudit.value = undefined;
            }
        };
    },
});
</script>
