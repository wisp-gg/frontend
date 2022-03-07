<template>
    <div class="flex items-center rounded-lg p-4 cursor-pointer w-full" :class="selected ? ['bg-primary-450'] : ['bg-primary-300']">
        <div class="inline-block flex items-center gap-x-1 flex-grow">
            <skeleton circle>
                <span class="rounded-lg text-center mr-3 h-8 w-8 flex shrink-0 items-center justify-center" :class="`${icon[1]} bg-opacity-50`">
                    <fa :icon="['fas', icon[0]]" class="text-xl" :class="`${icon[2]}`" />
                </span>
            </skeleton>

            <!-- Action -->
            <skeleton :content="32">
                <audit-log-message :audit="audit" />
            </skeleton>
        </div>

        <div class="flex items-center">
            <skeleton :content="8">
                <p class="text-white/75 text-right" v-tippy="tooltip">
                    {{ formattedDate }}
                </p>
            </skeleton>

            <fa :icon="['fas', 'chevron-right']" class="ml-4" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { formatDate, formatDateAbsolute } from '~/core';
import { AuditLog } from '~/api/models';
import AuditLogMessage from './AuditLogMessage.vue';

export default defineComponent({
    components: { AuditLogMessage },

    props: {
        audit: {
            type: AuditLog,
        },
        selected: {
            type: Boolean,
        },
    },
    setup(props) {
        return {
            icon: computed(() => {
                if (!props.audit) return;

                switch(props.audit.subaction) {
                    case 'create': return ['plus', 'bg-success', 'text-accent-500'];
                    case 'update': return ['pencil-alt', 'bg-warning', 'text-warning'];
                    case 'delete': return ['trash', 'bg-danger', 'text-danger'];
                    case 'trigger': return ['play-circle', 'bg-blue-500', 'text-blue-300'];
                    case 'deploy': return ['server', 'bg-blue-500', 'text-blue-300'];
                    case 'download': return ['download', 'bg-accent-300', 'text-accent-500'];
                    case 'restart':
                    case 'crash':
                        return ['power-off', 'bg-danger', 'text-danger'];

                    default: return ['question', 'bg-accent-200', 'text-accent-500'];
                }
            }),

            translationKey: computed(() => {
                if (!props.audit) return;

                return `audits.${props.audit.action.replace(/:/g, '.')}.${props.audit.subaction}`;
            }),

            templatableMeta: computed(() => {
                if (!props.audit?.metadata) return [];

                return Object.keys(props.audit.metadata).filter(a => a !== 'changes');
            }),

            formattedDate: computed(() => props.audit?.createdAt ? formatDate(props.audit?.createdAt, 'L LT') : null),
            tooltip: computed(() => {
                if (props.audit?.createdAt) {
                    return [formatDateAbsolute(props.audit.createdAt as string, 'LLLL'), 'bottom-start', true];
                }

                return null;
            }),
        };
    },
});
</script>
