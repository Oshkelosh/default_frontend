/** Cookie consent helpers for Site Settings `cookie_consent_mode`. */

export type CookieConsentMode = 'off' | 'notice' | 'zaraz';

/** ponytail: wait ceiling for Zaraz auto-inject; bump only if real shops miss it. */
export const ZARAZ_WAIT_MS = 2500;

export const ZARAZ_CONSENT_READY_EVENT = 'zarazConsentAPIReady';

export const REOPEN_COOKIE_NOTICE_EVENT = 'oshkelosh:reopen-cookie-notice';

export function resolveCookieConsentMode(site: {
	cookie_consent_mode?: string | null;
	gdpr_banner_enabled?: boolean;
}): CookieConsentMode {
	const raw = site.cookie_consent_mode?.trim().toLowerCase();
	if (raw === 'off' || raw === 'notice' || raw === 'zaraz') return raw;
	if (site.gdpr_banner_enabled) return 'notice';
	return 'off';
}

export function hostBannerVisible(opts: {
	mode: CookieConsentMode;
	dismissed: boolean;
	zarazReady: boolean;
	zarazTimedOut: boolean;
}): boolean {
	if (opts.dismissed) return false;
	if (opts.mode === 'notice') return true;
	if (opts.mode === 'zaraz') {
		if (opts.zarazReady) return false;
		return opts.zarazTimedOut;
	}
	return false;
}

export function showCookieSettings(mode: CookieConsentMode): boolean {
	return mode === 'zaraz';
}

export function isZarazConsentReady(): boolean {
	return typeof window !== 'undefined' && !!window.zaraz?.consent;
}

/** Open Zaraz CMP if present. Returns false when the caller should reopen the host notice. */
export function openZarazConsentModal(): boolean {
	if (typeof window === 'undefined' || !window.zaraz?.consent) return false;
	window.zaraz.consent.modal = true;
	return true;
}
