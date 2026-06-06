import { ApiError } from '$lib/types';
import { apiUrl } from './config';

const ACCESS_TOKEN_KEY = 'oshkelosh_access_token';
const REFRESH_TOKEN_KEY = 'oshkelosh_refresh_token';

export function getStoredAccessToken(): string | null {
	if (typeof localStorage === 'undefined') return null;
	return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
	if (typeof localStorage === 'undefined') return null;
	return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeTokens(accessToken: string, refreshToken: string): void {
	localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
	localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearStoredTokens(): void {
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function parseErrorResponse(response: Response): Promise<string> {
	let message = `Request failed (${response.status})`;
	try {
		const body = await response.json();
		if (typeof body.detail === 'string') {
			message = body.detail;
		} else if (typeof body.message === 'string') {
			message = body.message;
		}
	} catch {
		// ignore parse errors
	}
	return message;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(apiUrl(path), {
		...init,
		headers: {
			Accept: 'application/json',
			...init?.headers
		}
	});

	if (!response.ok) {
		throw new ApiError(await parseErrorResponse(response), response.status);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
	const refreshToken = getStoredRefreshToken();
	if (!refreshToken) return false;

	try {
		const data = await apiFetch<{ access_token: string; refresh_token: string }>(
			'/api/v1/auth/refresh',
			{
				method: 'POST',
				headers: { Authorization: `Bearer ${refreshToken}` }
			}
		);
		storeTokens(data.access_token, data.refresh_token);
		return true;
	} catch {
		clearStoredTokens();
		return false;
	}
}

async function ensureRefreshed(): Promise<boolean> {
	if (!refreshPromise) {
		refreshPromise = refreshAccessToken().finally(() => {
			refreshPromise = null;
		});
	}
	return refreshPromise;
}

export async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const accessToken = getStoredAccessToken();
	const headers: Record<string, string> = {
		Accept: 'application/json',
		...(init?.headers as Record<string, string> | undefined)
	};

	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	const method = init?.method?.toUpperCase() ?? 'GET';
	if (method !== 'GET' && method !== 'HEAD' && init?.body && !headers['Content-Type']) {
		headers['Content-Type'] = 'application/json';
	}

	const doFetch = () =>
		fetch(apiUrl(path), {
			...init,
			headers
		});

	let response = await doFetch();

	if (response.status === 401 && getStoredRefreshToken()) {
		const refreshed = await ensureRefreshed();
		if (refreshed) {
			const newToken = getStoredAccessToken();
			if (newToken) {
				headers.Authorization = `Bearer ${newToken}`;
			}
			response = await doFetch();
		}
	}

	if (!response.ok) {
		throw new ApiError(await parseErrorResponse(response), response.status);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}
