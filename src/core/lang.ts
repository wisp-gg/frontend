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

import Logger from './logger';
import state from '~/state';

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

    // Check if we have empty values, and fallback to the english translation
    for(const category in dates) {
        if (category === 'name') continue;

        for(const key in dates[category]) {
            if (!dates[category][key]) dates[category][key] = (dayjs.Ls['en'] as any)[category][key];
        }
    }

    dayjs.locale(name, dates);
}

const lang = createI18n({
    locale: 'en',
});

export async function loadLanguage(name: string) {
    Logger.debug('Lang', `Missing ${name}, loading...`);

    const data: Record<string, any> = {};
    await Promise.all(
        ['admin', 'audits', 'client', 'components', 'daemon', 'dates', 'generic', 'login', 'navigation', 'permissions', 'notifications', 'server'].map(namespace =>
            import(`../locales/${name}/${namespace}.json`)
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
    // TODO: can vite somehow hint folders in a dir? (probably not a good idea until all of the translations are good to go)
    return [
        'en', // English
        'cs_CZ', // Czech
        'da_DK', // Danish
        'nl_NL', // Dutch
        'fr_FR', // French
        'es_EM', // Spanish (Modern)
        'sv_SE', // Swedish
        'pl_PL', // Polish
    ];
}

export function getCurrentLanguage() {
    // There seems to be a weird bug(?) where `lang.global.locale` is a ComputedRefImpl instead of just a string
    const global: any = lang.global;
    return global.locale?.value ?? global.locale;
}

export async function setCurrentLanguage(language: string) {
    if (!getAvailableLanguages().includes(language)) return;

    const messages: any = lang.global.messages;
    if (!messages[language]) await loadLanguage(language);

    Logger.debug('Lang', `Setting the current language as ${language}.`);
    dayjs.locale(language);

    // There seems to be a weird bug(?) where `lang.global.locale` is a ComputedRefImpl instead of just a string
    const global: any = lang.global;
    if (global.locale?.value) global.locale.value = language;
    else global.locale = language;
}

// TODO: Wait till pinia is initialized
// state.user.$onAction(action => {
//     if (action.name === 'update') {
//         const newLanguage = action.args[0]?.preferences?.language;
//         if (newLanguage) setCurrentLanguage(newLanguage);
//     }
// });

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
