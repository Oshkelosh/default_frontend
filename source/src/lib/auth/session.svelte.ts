import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister } from '$lib/api/auth';
import { getCart } from '$lib/api/cart';
import {
	clearStoredTokens,
	getStoredAccessToken,
	storeTokens
} from '$lib/api/client';
import type { User, UserLogin, UserRegister } from '$lib/types';

export const authState = $state({
	user: null as User | null,
	cartItemCount: 0,
	initialized: false,
	loading: false
});

export function getAccessToken(): string | null {
	return getStoredAccessToken();
}

export async function refreshCartCount(): Promise<void> {
	if (!getStoredAccessToken()) {
		authState.cartItemCount = 0;
		return;
	}

	try {
		const cart = await getCart();
		authState.cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
	} catch {
		authState.cartItemCount = 0;
	}
}

export async function initSession(): Promise<void> {
	if (authState.initialized) return;
	authState.loading = true;

	try {
		if (getStoredAccessToken()) {
			authState.user = await getMe();
			await refreshCartCount();
		}
	} catch {
		clearStoredTokens();
		authState.user = null;
		authState.cartItemCount = 0;
	} finally {
		authState.initialized = true;
		authState.loading = false;
	}
}

export async function login(credentials: UserLogin): Promise<void> {
	const tokens = await apiLogin(credentials);
	storeTokens(tokens.access_token, tokens.refresh_token);
	authState.user = await getMe();
	await refreshCartCount();
}

export async function registerAndLogin(data: UserRegister): Promise<void> {
	await apiRegister(data);
	await login({ email: data.email, password: data.password });
}

export async function logout(): Promise<void> {
	try {
		if (getStoredAccessToken()) {
			await apiLogout();
		}
	} catch {
		// discard tokens even if logout request fails
	} finally {
		clearStoredTokens();
		authState.user = null;
		authState.cartItemCount = 0;
	}
}
