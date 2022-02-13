<template>
    <v-form service-id="eggs@updateThumbnail">
        <container class="w-full lg:w-1/2" title="admin.nests.egg.thumbnail_title">
            <v-image name="asset" :image="egg?.thumbnail || minecraft" extensions="png,jpg,jpeg,svg" accept="image/*" />

            <p class="text-center mt-3">
                <span class="font-bold mr-1">
                    <t path="admin.settings.branding.recommended_size" />
                </span>

                <t path="admin.nests.egg.thumbnail_recommended_size" />
            </p>

            <p class="text-center mt-3">
                <span class="font-bold mr-1">
                    <t path="generic.formats" />
                </span>

                <t path="admin.nests.egg.thumbnail_formats" />
            </p>

            <div class="mt-3 text-right space-x-4">
                <v-form service-id="eggs@updateThumbnail" class="inline-block">
                    <v-submit color="danger" permission="egg.update">
                        <t path="generic.reset" />
                    </v-submit>
                </v-form>

                <v-submit color="primary" permission="egg.update">
                    <t path="generic.save" />
                </v-submit>
            </div>
        </container>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { state } from '~/core';
import minecraft from '~/assets/svg/minecraft.png';

export default defineComponent({
    setup() {
        return {
            minecraft,
            egg: computed(() => state.models.egg),
        };
    }
});
</script>
