import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import RelativeFormat from 'dayjs/plugin/relativeTime';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import UTC from 'dayjs/plugin/utc';
import Timezone from 'dayjs/plugin/timezone';
dayjs.extend(RelativeFormat);
dayjs.extend(LocalizedFormat);
dayjs.extend(UTC);
dayjs.extend(Timezone);

import { default as Store } from '~/core/store';

function setDayjsLocale(name: string, dates: Record<string, any>) {
    dates.name = name;

    if (dates.relative_time) {
        dates.relativeTime = dates.relative_time;
        delete dates.relative_time;

        for(const key in dates.relativeTime) {
            let value = dates.relativeTime[key];
            if (['past', 'future'].includes(key)) {
                value = value.replaceAll('{time}', '%s');
            } else {
                value = value.replaceAll('{time}', '%d');
            }

            dates.relativeTime[key] = value;
        }
    }

    dayjs.locale(name, dates);
}

const lang = createI18n({
    locale: 'en',

    messages: {
        en: {},
    },
});

async function loadLanguage(name: string) {
    if (name !== 'en') {
        // TODO: handle new languages properly
        throw new Error('Currently, only `en` is supported as a language.');
    }

    const data: Record<string, any> = {};
    await Promise.all(
        ['admin', 'audits', 'client', 'components', 'daemon', 'dates', 'generic', 'login', 'navigation', 'permissions', 'notifications', 'server'].map(namespace =>
            import(`../locales/en/${namespace}.json`)
                .then(({ default: contents }) => data[namespace] = contents)
        )
    );

    setDayjsLocale(name, data.dates);
    delete data.dates;
    lang.global.setLocaleMessage(name, data);

    return nextTick();
}

export default lang;

export function getAvailableLanguages() {
    return lang.global.availableLocales;
}

export function getCurrentLanguage() {
    return lang.global.locale;
}

export async function setCurrentLanguage(language: string) {
    if (!getAvailableLanguages().includes(language)) return;

    await loadLanguage(language);

    lang.global.locale = language;
    dayjs.locale(language);
}

Store.subscribe(mutation => {
    if (mutation.type === 'user/update') {
        const newLanguage = mutation.payload?.preferences?.language;
        if (newLanguage) setCurrentLanguage(newLanguage);
    }
});

function createDayjsInstance(value: string, timezone?: string) {
    if (timezone) return dayjs(value).tz(timezone).locale(lang.global.locale);

    return dayjs(value).locale(lang.global.locale);
}

export function formatDate(value: string, format: string, timezone?: string) {
    if (dayjs(new Date()).diff(dayjs(value), 'd') >= 1) {
        return formatDateAbsolute(value, format, timezone);
    } else {
        return formatDateRelative(value, timezone);
    }
}

export function formatDateRelative(value: string, timezone?: string) {
    return createDayjsInstance(value, timezone).fromNow();
}

export function formatDateAbsolute(value: string, format: string, timezone?: string) {
    return createDayjsInstance(value, timezone).format(format);
}
