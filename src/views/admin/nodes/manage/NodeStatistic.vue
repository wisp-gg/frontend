<template>
    <div class="bg-red-800 flex rounded-lg">
        <div class="w-1/4 bg-black/25 flex justify-center items-center">
            <fa :icon="['fas', 'globe']" class="text-4xl" />
        </div>
        <div class="w-full p-1">
            <h3>Title</h3>
            <p>5</p>

            <div class="-mx-1 my-2 h-[2px] min-w-full bg-white/25">
                <div class="bg-white" style="width:75%" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        return {};
    }
});
</script>
