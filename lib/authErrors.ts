/**
 * Clerk's own error `message` is written for developers and is explicitly not
 * guaranteed to be stable — `code` is. We map codes to Recurrly's voice so the
 * user never sees raw SDK copy.
 *
 * Despite the name this covers every Clerk call we make, not just sign in and
 * sign up — profile updates surface the same shaped errors.
 */
const AUTH_ERROR_COPY: Record<string, string> = {
    form_identifier_not_found: "We couldn't find an account with that email.",
    form_password_incorrect: "That password doesn't match. Try again.",
    form_identifier_exists: "That email is already registered. Sign in instead.",
    form_param_format_invalid: "That doesn't look like a valid email.",
    form_password_length_too_short: "Use at least 8 characters.",
    form_password_pwned: "That password has appeared in a data breach. Choose another.",
    form_password_not_strong_enough: "Pick a stronger password.",
    form_code_incorrect: "That code isn't right. Check and re-enter it.",
    verification_expired: "That code expired. Send a new one.",
    verification_failed: "Too many failed attempts. Send a new code.",
    session_exists: "You're already signed in.",
    too_many_requests: "Too many attempts. Wait a moment and try again.",
    network_error: "No connection. Check your network and try again.",

    // Profile image upload
    form_param_value_invalid: "That image isn't supported. Try a JPG or PNG.",
    request_body_too_large: "That image is too large. Pick a smaller one.",
    image_too_large: "That image is too large. Pick a smaller one.",
    file_size_exceeded: "That image is too large. Pick a smaller one.",
};

export const FALLBACK_AUTH_ERROR = 'Something went wrong. Please try again.';

/** Anything Clerk hands back with a machine-stable `code`. */
type CodedError = { code?: string | null } | null | undefined;

/** Brand-native copy for a single Clerk error, or `null` when there is no error. */
export function authErrorMessage(error: CodedError): string | null {
    if (!error) return null;
    const code = error.code;
    if (!code) return FALLBACK_AUTH_ERROR;
    return AUTH_ERROR_COPY[code] ?? FALLBACK_AUTH_ERROR;
}

/**
 * Copy for the first form-level (non-field) error, so screens can surface
 * problems that don't belong to a specific input.
 */
export function globalAuthErrorMessage(globalErrors: CodedError[] | null | undefined): string | null {
    if (!globalErrors?.length) return null;
    return authErrorMessage(globalErrors[0]);
}
