<template>
    <label class="cursor-pointer">
        <!-- TODO(@havasu): Create a nice box which supports drag-and-drop file uploads -->

        <input type="file" :name="name" :data-extensions="extensions" :accept="accept" @change="change" />
    </label>
</template>

<script lang="ts">
import { defineComponent, ref, inject, onBeforeMount, onBeforeUnmount } from 'vue';

export default defineComponent({
    props: {
        name: {
            type: String,
            required: true,
        },
        extensions: {
            type: String,
        },
        accept: {
            type: String,
        },
    },

    setup(props) {
        const formFile = ref<File | undefined>();

        let unregister: any;

        onBeforeMount(() => {
            unregister = inject<registerFormComponentFn | null>('registerFormComponent', null)?.({
                key: props.name,
                value: formFile,
            });
        });

        onBeforeUnmount(() => {
            unregister?.();
            unregister = null;
        });

        return {
            change: ({ target }: any) => { // HTMLInputElement type has no `target`?
                if (target.files && target.files[0]) {
                    const file = target.files[0];
                    const fileName = file.name;
                    const fileExt = fileName.split('.').pop();

                    if (props.extensions && !props.extensions.split(',').includes(fileExt)) {
                        // TODO: Show some error

                        // imagePreview.value?.removeAttribute('src');
                        // imagePreview.value?.setAttribute('alt', t('generic.invalid_file_type'));
                        return;
                    }

                    formFile.value = file;
                }
            },
        };
    },
});
</script>
