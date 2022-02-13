<template>
    <div class="p-2 pl-3" :class="`notification-${announcement.type}`">
        <p class="text-white">
            {{ announcement.text }}
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Announcement } from '~/api/models';

export default defineComponent({
    props: {
        announcement: {
            required: true,
            type: Announcement,
        },
    },
});
</script>
