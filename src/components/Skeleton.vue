<template>
    <span v-if="loading" :class="circle ? ['rounded-full'] : ['rounded']" class="bg-primary-400 bg-no-repeat animate-slide bg-gradient-to-r from-primary-400 via-primary-200 to-primary-400 leading-none text-transparent select-none">
        {{ placeholder }}
    </span>
    <slot v-else />
</template>

<script lang="ts">
import { defineComponent, computed, inject, PropType } from 'vue';
import { Logger, getter } from '~/core';

export default defineComponent({
    props: {
        content: {
            type: [String, Number],
        },
        circle: {
            type: Boolean,
        },
        when: {
            type: [String, Array] as PropType<string | string[]>,
        },
    },

    setup(props) {
        if (!props.content && !props.circle) throw new Error('Skeleton: must define content prop or set circle to true');

        const isLoading = getter<(id?: string) => boolean>('loading/isLoading');
        const skeletonContext = inject<undefined | (() => string[])>('skeletonContext', undefined);

        if (!props.when && !skeletonContext) {
            Logger.warn('Skeleton', 'Detected no context information for when I should be displayed :(');
        }

        return {
            loading: computed(() => {
                if (props.when || skeletonContext) {
                    const map = (data: undefined | string | string[]) => {
                        if (!data) return [];

                        return Array.isArray(data) ? data : [data];
                    };
                    const items = [
                        ...map(props.when),
                        ...map(skeletonContext?.())
                    ];

                    for(const item of items) {
                        if (isLoading(item)) return true;
                    }

                    return false;
                }

                return isLoading();
            }),

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
