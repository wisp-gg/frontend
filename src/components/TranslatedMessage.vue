<template>
    {{ prefix }}{{ suffix }}
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: 'TranslatedMessage',

    props: {
        path: {
            type: [String, Array],
            required: true,
        },
        suffix: {
            type: String,
        },
        uppercase: {
            type: Boolean,
        },
    },

    setup(props, context) {
        const { t } = useI18n();

        return {
            prefix: computed(() => {
                let res: any;
                if (Array.isArray(props.path)) {
                    if (props.path[0] === '_raw') res = props.path[1];
                    else res = t(props.path[0] as string, props.path[1] as any);
                } else {
                    res = t(props.path);
                }

                return props.uppercase ? res.toUpperCase() : res;
            }),
        };
    }
});
</script>
