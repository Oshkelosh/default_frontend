import { ApiError } from '$lib/types';
import { apiUrl } from './config';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(apiUrl(path), {
		...init,
		headers: {
			Accept: 'application/json',
			...init?.headers
		}
	});

	if (!response.ok) {
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
		throw new ApiError(message, response.status);
	}

	return response.json() as Promise<T>;
}
