import Logger from './logger';
import lang from '~/core/lang';

const normalizes: Record<string, boolean> = {};
const validationRules: ValidationRules = {
    required: (value: any) => {
        let valid = false;
        if (typeof value === 'string' || Array.isArray(value)) valid = value.length > 0;
        else if (typeof value === 'number') valid = !Number.isNaN(value);
        else if (typeof value === 'object') valid = value && Object.keys(value).length > 0;

        return {
            valid,
        };
    },
    integer: (value: any) => {
        return {
            valid: !Number.isNaN(Number(value)),
            normalized: Number(value),
        };
    },
    email: (value: any) => {
        return {
            valid: /\S+@\S+\.\S+/.test(value),
        };
    },
    min: (value: any, input: any) => {
        if (isNaN(parseInt(value)) || Array.isArray(value)) value = value.length;
        else if (typeof value === 'object') value = Object.keys(value).length;

        return {
            valid: value >= input,
        };
    },
    max: (value: any, input: any) => {
        if (isNaN(parseInt(value)) || Array.isArray(value)) value = value.length;
        else if (typeof value === 'object') value = Object.keys(value).length;

        return {
            valid: value <= input,
        };
    },
    regex: (value: any, input: any) => {
        return {
            valid: new RegExp(input).test(value),
        };
    },
};

function guessType(input: any) {
    if ([undefined, null].includes(input)) return input;

    const number = Number(input);
    if (!isNaN(number)) return number;

    return input;
}

export class Validator {
    static validate(name: string, value: any, ruleStr?: string): ValidatedResponse {
        if (!ruleStr) return {};

        const splitRules = ruleStr.split('|');
        const sortedRules: [string, any?][][] = [[], []];
        for(const rule of splitRules) {
            const ruleSplit = rule.split(':');
            const ruleName = ruleSplit.shift() as string;
            const ruleData = ruleSplit.join(':');
            console.log(ruleName, ruleData);
            if (!validationRules[ruleName]) {
                Logger.warn('Validator', `Unable to validate ${name}: Unknown validation rule ${ruleName}`);
                continue;
            }

            // Sort into two arrays - first one is normalizable rules, and second is everything else.
            // Consider e.g. `max:32|numeric` and `numeric|max:32` on why (in this case they should mean the same).
            sortedRules[normalizes[ruleName] ? 0 : 1].push(
                [ruleName, guessType(ruleData)]
            );
        }

        let normalized = value;
        for(const rules of sortedRules) {
            const errors: TranslatableMessage[] = [];
            for(const [ruleName, ruleData] of rules) {
                try {
                    const res = validationRules[ruleName](normalized, ruleData);
                    if (!res.valid) {
                        const additionalData: Record<string, any> = {};
                        if (ruleData != undefined) additionalData[ruleName] = ruleData;

                        errors.push(
                            [`components.form.validator.${ruleName}`, additionalData]
                        );
                    } else {
                        if (res.normalized !== undefined) normalized = res.normalized;
                    }
                } catch(err) {
                    Logger.warn('Validator', `Unintended use of a rule ${ruleName} (${ruleData}) with input '${normalized}'?\n${err}`);
                }
            }

            if (errors.length > 0) {
                return {
                    errors,
                };
            }
        }

        return {
            normalized,
        };
    }

    static formValidate(name: string, value: any, rule: string, global?: boolean): { errors?: TranslatableMessage[]; normalized?: any; } {
        const { errors, normalized } = Validator.validate(name, value, rule);

        if (errors) {
            // Inject the field name
            const mappedErrors: TranslatableMessage[] = errors.map(error => {
                if (global) {
                    error[1] = {
                        ...(error[1] || {}),
                        field: lang.global.t(`components.form.fields.${name}`).toLowerCase(),
                        count: 2, // Trick i18n to using the pluralized string which is for global errors
                    };
                }

                return error;
            });

            return {
                errors: mappedErrors,
                normalized,
            };
        }

        return {
            normalized,
        };
    }
}
