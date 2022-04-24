<template>
    <span v-if="loading" :class="circle ? ['rounded-full'] : ['rounded']" class="bg-primary-400 bg-no-repeat animate-slide bg-gradient-to-r from-primary-400 via-primary-200 to-primary-400 leading-none text-transparent select-none">
        {{ placeholder }}
    </span>
    <slot v-else />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { getter } from '~/core';

export default defineComponent({
    props: {
        content: {
            type: [String, Number],
        },
        circle: {
            type: Boolean,
        }
    },

    setup(props) {
        if (!props.content && !props.circle) throw new Error('Skeleton: must define content prop or set circle to true');

        return {
            loading: computed(() => getter<(id?: string) => boolean>('loading/isLoading')()),

            placeholder: computed(() => {
                if (typeof props.content === 'number') {
                    return '#'.repeat(props.content);
                }

                return props.content;
            }),
        };
    }
});
</script>
