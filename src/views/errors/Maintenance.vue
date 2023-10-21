<template>
    <div class="flex flex-col justify-center items-center flex-grow">
        <div class="text-center">
            <h1 class="text-warning font-bold text-5xl">
                <t path="navigation.maintenance.title" />
            </h1>
            <p class="py-2">
                <t path="navigation.maintenance.description" />
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
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        return {};
    }
});
</script>
