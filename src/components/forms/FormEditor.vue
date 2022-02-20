<template>
    <div :class="heightClass" ref="editorElem" />
</template>

<script lang="ts">
import { defineComponent, ref, inject, onMounted, onBeforeMount, onBeforeUnmount, computed } from 'vue';
// @ts-ignore
import ace from 'ace-builds/src-noconflict/ace';
// @ts-ignore
import whitespace from 'ace-builds/src-noconflict/ext-whitespace';
// @ts-ignore
import modelist from 'ace-builds/src-noconflict/ext-modelist';

// TODO: can we come up with a more cleaner solution?
ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.13/src-noconflict');

export default defineComponent({
    emits: ['update:value', 'modes'],
    props: {
        name: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        value: {
            type: String,
        },
        height: {
            type: String,
            validator: (val: string) => ['small', 'normal', 'large'].includes(val),
            default: 'normal',
        }
    },

    setup(props, { emit }) {
        emit('modes', modelist.modes);

        const editorElem = ref<HTMLElement | undefined>();
        const editorValue = ref<string>('');
        onMounted(() => {
            if (!editorElem.value) throw new Error('Unable to initialize editor - editor element is missing???');

            const editor = ace.edit(editorElem.value);
            editor.setTheme('ace/theme/dracula');
            editor.setShowPrintMargin(false);
            editor.getSession().setUseSoftTabs(true);
            editor.getSession().setUseWrapMode(true);

            const setValue = (value: string) => {
                editorValue.value = value;
                emit('update:value', value);
            };

            if (props.value) {
                editor.getSession().setValue(props.value);
                setValue(props.value);
            }
            editor.getSession().on('change', () => setValue(editor.getValue()));

            const { mode } = modelist.getModeForPath(props.path);
            // TODO(@trixter): GLua support
            editor.getSession().setMode(mode);

            // TODO: ctrl+s hotkey, @see https://dev.crident.me/WISP/Panel/-/blob/develop/resources/assets/js/frontend/files/editor.js#L44-55
            // Should most likely just be something that gets passed to the parent with provide/inject?

            editor.commands.addCommands(whitespace.commands);
            whitespace.detectIndentation(editor.session);
        });

        let unregister: any;

        onBeforeMount(() => {
            unregister = inject<registerFormComponentFn | null>('registerFormComponent', null)?.({
                key: props.name,
                value: editorValue,
            });
        });

        onBeforeUnmount(() => {
            unregister?.();
            unregister = null;
        });

        return {
            editorElem,
            heightClass: computed(() => {
                switch (props.height) {
                    case 'small':
                        return 'h-[350px]';
                    case 'large':
                        return 'h-[700px]';
                    case 'normal':
                    default:
                        return 'h-[500px]';
                }
            }),
        };
    },
});
</script>
