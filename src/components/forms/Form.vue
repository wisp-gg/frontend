<template>
    <form :id="id" @submit.prevent="submit" novalidate>
        <slot />
    </form>
</template>

<script lang="ts">
import { defineComponent, provide, inject, ref, watch } from 'vue';
import { dispatch, Validator } from '~/core';
import { useService } from '~/plugins';

export default defineComponent({
    name: 'Form',

    props: {
        id: {
            type: String,
        },
        global: {
            type: Boolean,
        },
        serviceId: {
            type: [Function, String],
            required: true,
        },
        onSuccess: {
            type: [Function, String],
        },
        canSubmit: {
            type: Boolean,
            default: true,
        }
    },

    setup(props) {
        // VueJS v3 doesn't allow us to easily grab all slot's components and their set value
        // (other than by touching the virtual DOM, without access to component's methods).
        // Therefore we'll need to use the provide/inject to implement some type of workaround
        // to allow custom validation and getting the actual form data.
        let formComponents: FormComponent[] = [];
        provide('registerFormComponent', (data: FormComponent) => {
            formComponents.push(data);

            return () => formComponents = formComponents.filter(a => a !== data);
        });

        const alertKey = inject<string | undefined>('alertKey', undefined);
        const displayFormErrors = () => {
            dispatch('alerts/clear');

            const errors = formComponents
                .map(component => component.errors?.value)
                .filter(errors => errors && errors.length > 0)
                .flat();
            if (errors.length > 0 && props.global) {
                dispatch('alerts/add', {
                    key: alertKey,

                    type: 'danger',
                    title: ['components.form.validation_error', errors.length],
                    messages: errors,
                });
            }

            return errors.length;
        };
        provide('displayFormErrors', () => displayFormErrors());

        provide('formGlobal', props.global);

        const canSubmit = ref<boolean>(props.canSubmit);
        provide('formCanSubmit', canSubmit);
        watch(() => props.canSubmit, value => canSubmit.value = value);

        const submit = () => {
            if (!canSubmit.value) return;

            formComponents.forEach(component => component.validate?.());
            if (displayFormErrors() > 0) return;

            const onSubmit = (state: boolean) => formComponents.forEach(component => component.onSubmit?.(state));
            onSubmit(true);

            const onSuccess = (data: any) => {
                formComponents.forEach(component => component.onSuccess?.(data));

                if (props.onSuccess) {
                    if (typeof props.onSuccess === 'string') {
                        dispatch('alerts/add', {
                            key: alertKey,

                            type: 'success',
                            title: [props.onSuccess],
                        });
                    } else {
                        props.onSuccess(data);
                    }
                }
            };

            const formData: Record<string, any> = {};
            formComponents
                .forEach(component => {
                    if (!component.key || !component.value) return;

                    const split = component.key!.split('.');
                    const finalKey = split.pop()!; // just assume this always exists

                    // We can assume this will succeed as all inputs are validated above.
                    const value = component.rule ?
                        Validator.validate(component.key, component.value!.value, component.rule).normalized
                        : component.value.value;

                    split.reduce((data, key) => data[key] = (data[key] || {}), formData)[finalKey] = value;
                });

            if (props.serviceId instanceof Function) {
                const output = props.serviceId(formData);
                if (output instanceof Promise) {
                    output
                        .then(res => onSuccess(res))
                        .finally(() => onSubmit(false));
                } else {
                    onSubmit(false);
                }
            } else {
                useService(props.serviceId, alertKey || true, formData)
                    .then(res => onSuccess(res))
                    .finally(() => onSubmit(false));
            }
        };
        provide('formSubmit', () => submit());

        return {
            submit
        };
    }
});
</script>
