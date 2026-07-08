import { apiFetch, clearTokens, setTokens } from '$lib/api/client';
import type { Token, User, UserLogin, UserProfileUpdate, UserRegister } from '$lib/types';

export async function login(credentials: UserLogin): Promise<Token> {
	const token = await apiFetch<Token>('/api/v1/auth/login', {
		method: 'POST',
		body: JSON.stringify(credentials)
	});
	setTokens(token.access_token, token.refresh_token);
	return token;
}

export async function register(payload: UserRegister): Promise<User> {
	return apiFetch<User>('/api/v1/auth/register', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function registerAndLogin(payload: UserRegister): Promise<User> {
	const user = await register(payload);
	await login({ email: payload.email, password: payload.password });
	return user;
}

export async function getProfile(): Promise<User> {
	return apiFetch<User>('/api/v1/auth/me', { auth: true });
}

export const getMe = getProfile;

export async function updateProfile(body: UserProfileUpdate): Promise<User> {
	return apiFetch<User>('/api/v1/auth/me', {
		method: 'PATCH',
		auth: true,
		body: JSON.stringify(body)
	});
}

export async function logout(): Promise<void> {
	try {
		await apiFetch('/api/v1/auth/logout', { method: 'POST', auth: true });
	} finally {
		clearTokens();
	}
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
	return apiFetch<{ message: string }>('/api/v1/auth/verify-email', {
		method: 'POST',
		body: JSON.stringify({ token })
	});
}

export async function forgotPassword(email: string): Promise<void> {
	await apiFetch('/api/v1/auth/forgot-password', {
		method: 'POST',
		body: JSON.stringify({ email })
	});
}

export async function resetPassword(token: string, password: string): Promise<void> {
	await apiFetch('/api/v1/auth/reset-password', {
		method: 'POST',
		body: JSON.stringify({ token, password })
	});
}
