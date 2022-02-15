<template>
    <v-select
        :options="searchOptions"
        :label-prop="labelProp"
        :value-prop="valueProp"
        :group-label-prop="groupLabelProp"
        :group-options-prop="groupOptionsProp"
        :value="currentValue"
        @update:value="onValueChanged"

        searchable
        no-translate
    />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useService } from '~/plugins';

export default defineComponent({
    emits: ['update:value'],
    props: {
        serviceId: {
            type: String,
            required: true,
        },
        labelProp: {
            type: String,
            required: true,
        },
        valueProp: {
            type: String,
            required: true,
        },
        groupLabelProp: {
            type: String,
        },
        groupOptionsProp: {
            type: String,
        },
        value: {
            type: Object,
        },
    },

    setup(props, { emit }) {
        const currentOptions = ref<any[]>([]);

        const setOptions = (options: any[]) => {
            currentOptions.value = options;

            return options;
        };

        return {
            currentValue: computed(() => props.value?.[props.valueProp]),
            searchOptions: (query: string) => {
                return useService<any>(props.serviceId, {
                    background: true,
                }, {
                    search: query
                }).then(results => {
                    if (!props.value) return setOptions(results.data);

                    if (props.groupLabelProp && props.groupOptionsProp) {
                        // TODO: Handle ensuring props.value is included (how to handle category?)

                        return setOptions(results.data);
                    }

                    return setOptions([props.value, ...results.data.filter((res: Record<string, any>) => res[props.valueProp] !== props.value![props.valueProp])]);
                });
            },

            onValueChanged: (value: any) => {
                if (props.groupLabelProp && props.groupOptionsProp) {
                    for (const category of currentOptions.value) {
                        const found = category[props.groupOptionsProp]?.find((r: any) => r[props.valueProp] === value);
                        if (found) return emit('update:value', found);
                    }
                } else {
                    const found = currentOptions.value.find(r => r[props.valueProp] === value);
                    if (found) return emit('update:value', found);
                }
            }
        };
    },
});
</script>
