<template>
    <span v-tippy="formattedValue[1]" class="w-auto">
        {{ formattedValue[0] }}
    </span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { formatDate, formatDateAbsolute } from '~/core/lang';

export default defineComponent({
    props: {
        timestamp: {
            type: String, Number,
            required: true
        }
    },

    setup(props) {
        return {
            formattedValue: computed(() => {
                return [
                    formatDate(props.timestamp, 'L LT'),
                    formatDateAbsolute(props.timestamp as string, 'LLLL')
                ];
            }),
        };
    }
});
</script>
