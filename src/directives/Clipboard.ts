import { Directive, DirectiveBinding } from 'vue';
import Clipboard from 'clipboard';
import tippy from 'tippy.js';
import lang from '~/core/lang';

function createClipboard(el: any, binding: DirectiveBinding) {
    if (binding.value === null) return;
    if (!el.classList.contains('cursor-pointer')) el.classList.add('cursor-pointer');

    const clipboard = new Clipboard(el, {
        text: () => binding.value ?? el.innerHTML,
        action: () => 'copy'
    });

    clipboard.on('success', ({ text }) => {
        if (el._tippy_destroy_timeout) {
            clearTimeout(el._tippy_destroy_timeout);
        }

        tippy(el, {
            content: lang.global.t('generic.copied_to_clipboard'),
            placement: 'bottom-start',
            duration: 0,
            trigger: 'manual',
            hideOnClick: true,
        });
        el._tippy.show();

        el._tippy_destroy_timeout = setTimeout(() => {
            if (el) el._tippy?.destroy?.();
        }, 2000);
    });

    // TODO: if it is a text field and copying fails, the user won't be able to really copy the value :/
    clipboard.on('error', e => alert(`Failed to copy ${e.text} to clipboard! ${e}`));

    el._clipboard = clipboard;
}

const directive: Directive = {
    mounted: (el, binding) => {
        createClipboard(el, binding);
    },
    updated: (el, binding) => {
        el._clipboard?.destroy();
        delete el._clipboard;

        createClipboard(el, binding);
    },
    unmounted: el => {
        el._clipboard?.destroy?.();
        delete el._clipboard;
    }
};

export default directive;
