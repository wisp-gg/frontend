import { Directive } from 'vue';
import tippy from 'tippy.js';
import lang from '~/core/lang';

function setTippy(el: any, value: any) {
    const [path, placement, alreadyTranslated] = Array.isArray(value) ? value : [value, 'bottom'];

    // Seems that if the directive initially gets updated twice in a short time span,
    // the first call to this function will be the latest directive, thus it would override
    // the up-to-date tippy with the older one, so this is a hacky fix around this behavior.
    // Not sure if this is a Vue bug or not, but I also can't be bothered to spend ages investigating.
    if (el._setTippy) return;
    el._setTippy = setTimeout(() => {
        if (el._tippy) {
            el._tippy?.setProps({
                placement,
                content: alreadyTranslated ? path : lang.global.t(path),
            });
        } else {
            tippy(el, {
                placement,
                content: alreadyTranslated ? path : lang.global.t(path),
            });
        }

        delete el._setTippy;
    }, 0);
}

const directive: Directive = {
    mounted: (el, binding) => {
        if (!binding.value) return;

        setTippy(el, binding.value);
    },
    updated: (el, binding) => {
        if (!binding.value) {
            if (el._setTippy) {
                clearTimeout(el._setTippy);
                delete el._setTippy;
            }

            el._tippy?.destroy();
            return delete el._tippy;
        }

        setTippy(el, binding.value);
    },

    beforeUnmount: el => {
        if (el._setTippy) {
            clearTimeout(el._setTippy);
            delete el._setTippy;
        }

        el._tippy?.destroy();
        return delete el._tippy;
    }
};

export default directive;
