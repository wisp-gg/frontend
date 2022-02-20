<template>
    <div class="h-[150px]" ref="editorElem" />
</template>

<style>
.highlight {
    background: rgba(255, 255, 0, 0.4);
    position: absolute;
}
</style>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
// @ts-ignore
import ace from 'ace-builds/src-noconflict/ace';

// TODO: can we come up with a more cleaner solution?
ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.13/src-noconflict');

export default defineComponent({
    props: {
        lines: {
            type: Array as () => string[],
            required: true,
        },
        highlight: {
            type: [String, Number],
        },
        lineStart: {
            type: Number,
        },
    },

    setup(props, context) {
        const editorElem = ref<HTMLElement | undefined>();

        onMounted(() => {
            if (!editorElem.value) throw new Error('Unable to initialize preview editor - editor element is missing???');

            const editor = ace.edit(editorElem.value);
            editor.setTheme('ace/theme/dracula');
            editor.setShowPrintMargin(false);
            editor.getSession().setUseSoftTabs(true);
            editor.getSession().setUseWrapMode(true);

            editor.setReadOnly(true);
            editor.setHighlightActiveLine(false);
            editor.setHighlightGutterLine(false);
            // editor.renderer.setStyle('disabled', true);
            editor.renderer.$cursorLayer.element.style.opacity = 0;

            editor.setOption('firstLineNumber', props.lineStart || 1);
            editor.getSession().setValue(props.lines.join('\n'));

            if (props.highlight) {
                const { Range } = ace.require('ace/range');
                if (typeof props.highlight === 'number') {
                    const range = new Range(props.highlight, 0, props.highlight, props.lines[props.highlight].length);

                    editor.getSession().addMarker(range, 'highlight', 'line', true);
                } else {
                    const re = new RegExp(props.highlight, 'g');

                    for (const lineNumber in props.lines) {
                        const actualLineNumber = Number(lineNumber);

                        let match;
                        while (match = re.exec(props.lines[lineNumber])) {
                            const range = new Range(actualLineNumber, match.index, actualLineNumber, match.index + props.highlight.length);

                            editor.getSession().addMarker(range, 'highlight', 'line', true);
                        }
                    }
                }
            }
        });

        return {
            editorElem,
        };
    },
});
</script>
