import { browser } from '$app/environment';

const DEV_API_ORIGIN = 'http://127.0.0.1:8000';

export function apiOrigin(): string {
	if (!browser) {
		return DEV_API_ORIGIN;
	}
	if (import.meta.env.DEV) {
		return DEV_API_ORIGIN;
	}
	return window.location.origin;
}

export function apiUrl(path: string): string {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${apiOrigin()}${normalized}`;
}
