/**
 * tokenManager — bridges Clerk's async getToken() with the axios interceptor.
 *
 * Doctors register their Clerk `getToken` function when the doctor layout mounts.
 * The axios interceptor calls `getAuthToken()` which always returns a fresh token
 * for doctor sessions and falls back to the patient JWT stored in localStorage.
 */

type TokenGetter = () => Promise<string | null>;

let _doctorTokenGetter: TokenGetter | null = null;

export function setDoctorTokenGetter(fn: TokenGetter): void {
    _doctorTokenGetter = fn;
}

export function clearDoctorTokenGetter(): void {
    _doctorTokenGetter = null;
}

export async function getAuthToken(): Promise<string | null> {
    if (_doctorTokenGetter) {
        try {
            const token = await _doctorTokenGetter();
            if (token) return token;
        } catch {
            // fall through to localStorage
        }
    }
    // Patient JWT (or a stale doctor token stored by previous sessions)
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
}
