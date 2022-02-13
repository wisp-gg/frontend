<template>
    <slot
        :name="`step-${currentStep}`"

        :next="nextStep"
        :previous="previousStep"
    />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
    emits: ['update:modelValue'],
    props: {
        modelValue: {
            type: Number,
        },
        steps: {
            type: Number,
            required: true,
        }
    },

    setup(props, { emit }) {
        const currentStep = ref(props.modelValue || 1);
        const setStep = (step: number) => {
            currentStep.value = step;
            emit('update:modelValue', step);
        };

        watch(() => props.modelValue, (newStep: number | undefined) => {
            if (!newStep) return;

            currentStep.value = newStep;
        });

        return {
            currentStep,
            setStep,

            nextStep: () => {
                if (currentStep.value === props.steps) return;

                setStep(currentStep.value + 1);
            },
            previousStep: () => {
                if (currentStep.value === 1) return;

                setStep(currentStep.value - 1);
            }
        };
    },
});
</script>
