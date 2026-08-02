/**
 * Client-side checks that run before any network call, so obvious mistakes
 * never cost the user a round trip.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;
export const VERIFICATION_CODE_LENGTH = 6;

export function validateEmail(value: string): string | null {
    const email = value.trim();
    if (!email) return 'Enter your email address';
    if (!EMAIL_PATTERN.test(email)) return "That doesn't look like a valid email";
    return null;
}

/**
 * On sign-in we only check for presence — telling someone their existing
 * password is "too short" leaks the rule and helps nobody.
 */
export function validatePassword(value: string, { isSignUp = false } = {}): string | null {
    if (!value) return 'Enter your password';
    if (isSignUp && value.length < MIN_PASSWORD_LENGTH) {
        return `Use at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    return null;
}

/** `label` is folded into the message, e.g. "Enter your first name". */
export function validateName(value: string, label: string): string | null {
    const name = value.trim()
    if (!name) return `Enter your ${label}`
    if (name.length > 50) return `That ${label} is too long`
    return null
}

export function validateCode(value: string): string | null {
    const code = value.trim();
    if (!code) return 'Enter the code we sent you';
    if (!new RegExp(`^\\d{${VERIFICATION_CODE_LENGTH}}$`).test(code)) {
        return `Enter the ${VERIFICATION_CODE_LENGTH}-digit code`;
    }
    return null;
}
