import Logger from '~/core/logger';

export default class {
    // More accurate equivalent of setTimeout - as setTimeout only guarantees
    // the callback running _after_ the delay, not _as close as possible_.
    // Though it's worth noting requestAnimationFrame has around ~17ms precision.
    static wait(callback: any, delay: number) {
        const start = performance.now();
        const check = () => {
            const hasBeen = performance.now() - start;
            if (hasBeen >= delay - 10) {
                if (delay - hasBeen > 25) {
                    Logger.warn('Timer', 'requestAnimationFrame has taken longer than 25ms per call: ' + (hasBeen - delay));
                }

                callback();
            } else {
                window.requestAnimationFrame(check);
            }
        };

        window.requestAnimationFrame(check);
    }
}
