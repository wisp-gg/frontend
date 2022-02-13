<template>
    <i18n-t :keypath="`${audit.translationKey()}.message`" tag="p" class="break-words">
        <template #user v-if="audit.user">
            <avatar :email="audit.user.email" class="rounded-lg h-7 inline-block" />
            <span class="text-white ml-2">
                {{ audit.user.fullName }}
            </span>
        </template>

        <template
            v-for="(key) in templatableMeta"
            #[key]
            :key="key"
        >
            <span class="text-white">
                {{ audit.metadata[key] }}
            </span>
        </template>
    </i18n-t>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { AuditLog } from '~/api/models';
import Avatar from '~/components/Avatar.vue';

export default defineComponent({
    components: { Avatar },

    props: {
        audit: {
            type: AuditLog,
            required: true,
        }
    },
    setup(props) {
        return {
            templatableMeta: computed(() => {
                if (!props.audit?.metadata || Array.isArray(props.audit?.metadata)) return [];

                return Object.entries(props.audit.metadata).filter(([key, value]) => {
                    return ['string', 'number', 'boolean'].includes(typeof value);
                }).map(([key]) => key);
            }),
        };
    },
});
</script>
