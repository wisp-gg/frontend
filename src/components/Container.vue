<template>
    <div class="bg-primary-500 bg-clip-content rounded-md">
        <div class="text-white text-opacity-75 border-b border-primary-400 p-3 sm:px-4">
            <slot name="header">
                <div class="flex">
                    <div class="flex flex-grow items-center">
                        <h3 class="text-xl text-white font-light">
                            <t v-if="title" :path="title" />
                            <template v-else>
                                No title specified
                            </template>
                        </h3>
                            <slot name="container-header-extra" />
                        <!-- TODO: description isn't centered vertically -->
                        <p v-if="description" class="ml-2 text-white text-opacity-50">
                            <!-- TODO: Investigate why this causes an error (switch from any page to databases to re-produce) -->
                            <!--<skeleton :content="8">-->
                            <t :path="formattedDescription" />
                            <!--</skeleton>-->
                        </p>
                    </div>

                    <slot name="actions" />
                </div>
            </slot>
        </div>

        <div :class="!noPadding ? ['p-3 sm:p-6'] : []">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
    props: {
        title: {
            type: [String, Array],
        },
        description: {
            type: [String, Array],
        },
        noPadding: {
            type: Boolean
        }
    },

    setup(props) {
        return {
            formattedDescription: computed(() => Array.isArray(props.description) ? props.description : [props.description, {}])
        };
    }
});
</script>
