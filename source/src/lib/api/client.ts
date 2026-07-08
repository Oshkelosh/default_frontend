import { browser } from '$app/environment';
import { apiUrl } from '$lib/api/config';
import { ApiError } from '$lib/types';

const ACCESS_TOKEN_KEY = 'oshkelosh:access_token';
const REFRESH_TOKEN_KEY = 'oshkelosh:refresh_token';

export function getAccessToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
	if (!browser) return;
	localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
	localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export const storeTokens = setTokens;

export function clearTokens(): void {
	if (!browser) return;
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
	return Boolean(getAccessToken());
}

async function parseErrorMessage(response: Response): Promise<string> {
	try {
		const data = await response.json();
		if (typeof data?.message === 'string') return data.message;
		if (typeof data?.detail === 'string') return data.detail;
		if (Array.isArray(data?.detail)) {
			return data.detail.map((entry: { msg?: string }) => entry.msg ?? 'Request failed').join(', ');
		}
	} catch {
		// ignore JSON parse errors
	}
	return response.statusText || 'Request failed';
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
	const refreshToken = getRefreshToken();
	if (!refreshToken) return false;

	const response = await fetch(apiUrl('/api/v1/auth/refresh'), {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${refreshToken}`,
			Accept: 'application/json'
		}
	});

	if (!response.ok) {
		clearTokens();
		return false;
	}

	const data = (await response.json()) as {
		access_token: string;
		refresh_token: string;
	};
	setTokens(data.access_token, data.refresh_token);
	return true;
}

async function refreshAccessTokenOnce(): Promise<boolean> {
	if (!refreshPromise) {
		refreshPromise = refreshAccessToken().finally(() => {
			refreshPromise = null;
		});
	}
	return refreshPromise;
}

export type ApiFetchOptions = RequestInit & {
	auth?: boolean;
	retryOnUnauthorized?: boolean;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
	const { auth = false, retryOnUnauthorized = true, headers, ...rest } = options;
	const requestHeaders = new Headers(headers);
	requestHeaders.set('Accept', 'application/json');

	if (rest.body && !requestHeaders.has('Content-Type')) {
		requestHeaders.set('Content-Type', 'application/json');
	}

	if (auth) {
		const token = getAccessToken();
		if (token) {
			requestHeaders.set('Authorization', `Bearer ${token}`);
		}
	}

	const response = await fetch(apiUrl(path), {
		...rest,
		headers: requestHeaders
	});

	if (response.status === 401 && auth && retryOnUnauthorized) {
		const refreshed = await refreshAccessTokenOnce();
		if (refreshed) {
			return apiFetch<T>(path, { ...options, retryOnUnauthorized: false });
		}
	}

	if (!response.ok) {
		throw new ApiError(await parseErrorMessage(response), response.status);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.includes('application/json')) {
		return undefined as T;
	}

	return (await response.json()) as T;
}
