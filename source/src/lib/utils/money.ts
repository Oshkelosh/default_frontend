/** Shop display currency — set from storefront config on boot. */
export let DEFAULT_CURRENCY = 'USD';

export const PREFERRED_CURRENCY_COOKIE = 'osh_preferred_currency';

export function setShopCurrency(currency: string | null | undefined): void {
	const code = (currency || 'USD').trim().toUpperCase();
	if (/^[A-Z]{3}$/.test(code)) {
		DEFAULT_CURRENCY = code;
	}
}

export function formatCents(cents: number, currency = DEFAULT_CURRENCY): string {
	const code = (currency || DEFAULT_CURRENCY).trim().toUpperCase() || DEFAULT_CURRENCY;
	try {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(
			cents / 100
		);
	} catch {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: DEFAULT_CURRENCY
		}).format(cents / 100);
	}
}

/** Soft preference cookie — does not change charged currency until FX exists. */
export function readPreferredCurrencyCookie(): string | null {
	if (typeof document === 'undefined') return null;
	const match = document.cookie.match(
		new RegExp(`(?:^|; )${PREFERRED_CURRENCY_COOKIE}=([^;]*)`)
	);
	const raw = match?.[1] ? decodeURIComponent(match[1]) : '';
	const code = raw.trim().toUpperCase();
	return /^[A-Z]{3}$/.test(code) ? code : null;
}

export function writePreferredCurrencyCookie(currency: string | null | undefined): void {
	if (typeof document === 'undefined') return;
	const code = (currency || '').trim().toUpperCase();
	if (!/^[A-Z]{3}$/.test(code)) return;
	document.cookie = `${PREFERRED_CURRENCY_COOKIE}=${encodeURIComponent(code)}; path=/; max-age=31536000; SameSite=Lax`;
}
