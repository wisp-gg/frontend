<template>
    <div class="relative h-full bg-primary-300 rounded-lg p-3 sm:p-8">
        <div @click="close" class="absolute top-8 right-8 text-right mr-2 text-xl cursor-pointer">
            <fa :icon="['fas', 'times']" />
        </div>

        <template v-if="audit">
            <div class="flex items-center w-[90%]">
                <span class="rounded-lg text-center mr-3 h-14 w-14 flex shrink-0 items-center justify-center" :class="`${icon[1]} bg-opacity-50`">
                    <fa :icon="['fas', icon[0]]" class="text-4xl" :class="`${icon[2]}`" />
                </span>

                <div>
                    <h1 class="text-white text-xl">
                        <t :path="`${audit.translationKey()}.title`" />
                    </h1>

                    <p>{{ formattedDate }}</p>
                </div>
            </div>

            <audit-log-message :audit="audit" :key="audit" class="p-4 my-4 border border-white/10 rounded-lg" />

            <div class="border border-white/10 rounded-lg overflow-hidden" v-if="audit.metadata.changes?.length > 0">
                <div class="p-4 bg-primary-50 text-white border-b border-white/10 rounded-t-lg">
                    <t path="generic.changes" />
                </div>

                <div class="p-4">
                    <div v-for="[key, value] in Object.entries(audit.metadata.changes)">
                        <!-- TODO: Support for parsing different changes like arrays (subuser permissions)
                             @see havasu's audit log design for subuser perm's in wisp-team-design
                        -->

                        <!-- If the value is just "true" it means it was changed but won't disclose the old or new value -->
                        <i18n-t v-if="value === true" keypath="server.audit_logs.changes.hidden_value">
                            <template #key>
                                {{ key }}
                            </template>
                        </i18n-t>

                        <!-- Value was changed & discloses old/new value -->
                        <i18n-t v-else keypath="server.audit_logs.changes.from_to">
                            <template #key>
                                {{ key }}
                            </template>

                            <template #old>
                                <span class="text-white">{{ value[0] }}</span>
                            </template>

                            <template #new>
                                <span class="text-white">{{ value[1] }}</span>
                            </template>
                        </i18n-t>
                    </div>
                </div>
            </div>

            <div class="border border-white/10 rounded-lg mt-4 overflow-hidden" v-if="metaKeys.length">
                <div class="p-4 bg-primary-50 text-white border-b border-white/10 rounded-t-lg">
                    <t path="generic.metadata" />
                </div>

                <div>
                    <table class="w-full">
                        <tr
                            class="odd:bg-primary-500 even:bg-primary-300"
                            v-for="key in metaKeys"
                            :key="key"
                        >
                            <td class="p-4">
                                {{ key[1] }}
                            </td>
                            <td class="p-4 break-all">
                                {{ audit.metadata[key[0]] }}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="border border-white/10 rounded-lg mt-4 overflow-hidden" v-if="hasDeviceInfo">
                <div class="p-4 bg-primary-50 text-white border-b border-white/10 rounded-t-lg">
                    <t path="generic.device_information" />
                </div>

                <div>
                    <table class="w-full">
                        <tr v-if="audit.device.cityName" class="odd:bg-primary-500 even:bg-primary-300">
                            <td class="p-4">
                                <t path="server.audit_logs.device.city" />
                            </td>
                            <td class="p-4">
                                {{ audit.device.cityName }}
                            </td>
                        </tr>
                        <tr v-if="audit.device.countryName || audit.device.countryIsoCode" class="odd:bg-primary-500 even:bg-primary-300">
                            <td class="p-4">
                                <t path="server.audit_logs.device.country" />
                            </td>
                            <td class="p-4">
                                {{ audit.device.countryName ?? 'UNKNOWN' }} ({{ audit.device.countryIsoCode ?? 'UNKNOWN' }})
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { formatDateAbsolute } from '~/core';
import { AuditLog } from '~/api/models';
import AuditLogMessage from './AuditLogMessage.vue';

export default defineComponent({
    components: { AuditLogMessage },
    emits: ['close'],
    props: {
        audit: {
            type: AuditLog
        }
    },

    setup(props, { emit }) {
        return {
            close: () => {
                emit('close');
            },

            formattedDate: computed(() => props.audit?.createdAt ? formatDateAbsolute(props.audit?.createdAt, 'L LT') : null),

            icon: computed(() => {
                if (!props.audit) return;

                switch(props.audit.subaction) {
                    case 'create': return ['plus', 'bg-success', 'text-accent-500'];
                    case 'update': return ['pencil-alt', 'bg-warning', 'text-warning'];
                    case 'delete': return ['trash', 'bg-danger', 'text-danger'];
                    case 'trigger': return ['play-circle', 'bg-blue-500', 'text-blue-300'];
                    case 'deploy': return ['server', 'bg-blue-500', 'text-blue-300'];
                    case 'download': return ['download', 'bg-accent-300', 'text-accent-500'];

                    default: return ['question', 'bg-accent-200', 'text-accent-500'];
                }
            }),

            metaKeys: computed(() => {
                if (!props.audit?.metadata) return [];

                return Object.keys(props.audit.metadata)
                    .filter(a => a !== 'changes')
                    .map(key => {
                        return [key, `${key.charAt(0).toUpperCase()}${key.slice(1)}`];
                    });
            }),

            hasDeviceInfo: computed(() => Object.keys(props.audit?.device || {}).filter(r => r !== 'userAgent').length > 0),
        };
    },
});
</script>
