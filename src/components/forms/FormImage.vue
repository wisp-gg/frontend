<template>
    <label class="flex justify-center cursor-pointer" v-tippy="`generic.click_to_upload_image`">
        <img :src="image" :height="height" :width="width" :alt="t('generic.loading')" ref="imagePreview">
        <input type="file" class="sr-only" :name="name" :data-extensions="extensions" :accept="accept" @change="change">
    </label>
</template>

<script lang="ts">
import { defineComponent, ref, inject, onBeforeMount, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    props: {
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        extensions: {
            type: String,
        },
        accept: {
            type: String,
        },
        height: {
            type: Number,
        },
        width: {
            type: Number,
        },
    },

    setup(props, context) {
        const { t } = useI18n();
        const imagePreview = ref<HTMLImageElement | undefined>();
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
            t,
            imagePreview,

            change: ({ target }: any) => { // HTMLInputElement type has no `target`?
                if (!imagePreview.value) throw new Error('Couldn\'t find imagePreview component...?');

                if (target.files && target.files[0]) {
                    const file = target.files[0];
                    const fileName = file.name;
                    const fileExt = fileName.split('.').pop();

                    if (!target.dataset?.extensions?.split(',').includes(fileExt)) {
                        imagePreview.value?.removeAttribute('src');
                        imagePreview.value?.setAttribute('alt', t('generic.invalid_file_type'));
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = res => {
                        if (!res.target?.result) return;

                        imagePreview.value?.setAttribute('src', res.target.result.toString());
                    };
                    imagePreview.value?.setAttribute('alt', t('generic.loading'));

                    reader.readAsDataURL(file);

                    formFile.value = file;
                }
            },
        };
    },
});
</script>
