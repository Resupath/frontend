interface ValidationRule<T> {
    validate: (value: T) => boolean;
    message: string;
}

interface ValidationResult {
    isValid: boolean;
    message: string;
}

interface ValidationResults {
    [key: string]: ValidationResult;
}

type ValidationRules<T> = {
    [K in keyof T]?: ValidationRule<T[K]>[];
};

export function validateField<T>(value: T, rules: ValidationRule<T>[]): ValidationResult {
    for (const rule of rules) {
        if (!rule.validate(value)) {
            return { isValid: false, message: rule.message };
        }
    }
    return { isValid: true, message: "" };
}

export function validateForm<T extends object>(values: T, rules: ValidationRules<T>): ValidationResults {
    const results: ValidationResults = {};

    for (const key in rules) {
        const fieldRules = rules[key];
        const value = values[key];

        if (fieldRules) {
            results[key] = validateField(value, fieldRules);
        }
    }

    return results;
}

// 미리 정의된 검증 규칙들
export const required = (message = "필수 입력 항목입니다"): ValidationRule<any> => ({
    validate: (value: any) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "string") return value.trim().length > 0;
        return value !== null && value !== undefined;
    },
    message,
});

export const minLength = (min: number, message = `최소 ${min}자 이상 입력해주세요`): ValidationRule<string> => ({
    validate: (value: string) => value.length >= min,
    message,
});

export const maxLength = (max: number, message = `최대 ${max}자까지 입력 가능합니다`): ValidationRule<string> => ({
    validate: (value: string) => value.length <= max,
    message,
});

export const pattern = (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value: string) => regex.test(value),
    message,
});

export const url = (message = "올바른 URL 형식이 아닙니다"): ValidationRule<string> => ({
    validate: (value: string) => {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    },
    message,
});

export const minItems = (min: number, message = `최소 ${min}개 이상 선택해주세요`): ValidationRule<any[]> => ({
    validate: (value: any[]) => value.length >= min,
    message,
});

export const maxItems = (max: number, message = `최대 ${max}개까지 선택 가능합니다`): ValidationRule<any[]> => ({
    validate: (value: any[]) => value.length <= max,
    message,
});
