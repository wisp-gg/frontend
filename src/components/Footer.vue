<template>
    <footer>
        <div class="w-full text-center py-5">
            <fa :icon="['fas', 'code-branch']" /> {{ version }}
        </div>
    </footer>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
    setup(props, context) {
        return {
            version: computed(() => `${window.Wisp.Node || 'unknown'} - ${window.Wisp.Version || 'unknown'}`),
        };
    }
});
</script>
