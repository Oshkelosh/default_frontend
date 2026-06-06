import { apiFetch, authFetch } from './client';
import type { Token, User, UserLogin, UserRegister } from '$lib/types';

export async function register(body: UserRegister): Promise<User> {
	return apiFetch<User>('/api/v1/auth/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

export async function login(body: UserLogin): Promise<Token> {
	return apiFetch<Token>('/api/v1/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

export async function logout(): Promise<void> {
	await authFetch('/api/v1/auth/logout', { method: 'POST' });
}

export async function getMe(): Promise<User> {
	return authFetch<User>('/api/v1/auth/me');
}
