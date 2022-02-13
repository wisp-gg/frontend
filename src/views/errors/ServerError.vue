<template>
    <div class="flex flex-col justify-center items-center flex-grow">
        <div class="text-center">
            <h1 class="text-white font-bold text-5xl">
                <t :path="`${error.title[0]}.title`" />
            </h1>
            <p class="py-2 text-xl">
                <t :path="`${error.title[0]}.description`" />
            </p>
            <div class="py-5">
                <v-button color="warning" class="p-4 mr-1" @click="$router.go(-1)">
                    ← <t path="navigation.errors.go_back" />
                </v-button>
                <v-button :to="{name: 'index'}" color="primary" class="p-4">
                    <t path="navigation.errors.go_home" />
                </v-button>
            </div>
        </div>
    </div>

    <v-footer />
</template>

<style scoped>
    button {
        line-height: revert;
    }
</style>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';

export default defineComponent({
    setup() {
        return {
            error: computed(() => state.alerts.items.find(r => r.title[0].startsWith('server.errors'))),
        };
    }
});
</script>
