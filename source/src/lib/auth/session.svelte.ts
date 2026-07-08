import { browser } from '$app/environment';
import { isAuthenticated } from '$lib/api/client';
import * as authApi from '$lib/api/auth';
import { mergeGuestCartIntoServer, resetCart, initCart } from '$lib/cart/cart.svelte';
import type { User, UserLogin, UserRegister } from '$lib/types';

type AuthState = {
	user: User | null;
	loading: boolean;
	initialized: boolean;
};

export const authState = $state<AuthState>({
	user: null,
	loading: false,
	initialized: false
});

let initPromise: Promise<void> | null = null;

export async function initSession(): Promise<void> {
	if (!browser) return;
	if (authState.initialized) return;
	if (initPromise) return initPromise;

	initPromise = (async () => {
		authState.loading = true;
		try {
			if (!isAuthenticated()) {
				authState.user = null;
				return;
			}
			authState.user = await authApi.getProfile();
		} catch {
			authState.user = null;
		} finally {
			authState.loading = false;
			authState.initialized = true;
		}
	})();

	return initPromise;
}

export async function login(credentials: UserLogin): Promise<User> {
	authState.loading = true;
	try {
		await authApi.login(credentials);
		const user = await authApi.getProfile();
		authState.user = user;
		await mergeGuestCartIntoServer();
		return user;
	} finally {
		authState.loading = false;
		authState.initialized = true;
	}
}

export async function register(payload: UserRegister): Promise<User> {
	authState.loading = true;
	try {
		const user = await authApi.registerAndLogin(payload);
		authState.user = user;
		await mergeGuestCartIntoServer();
		return user;
	} finally {
		authState.loading = false;
		authState.initialized = true;
	}
}

export async function logout(): Promise<void> {
	authState.loading = true;
	try {
		await authApi.logout();
	} finally {
		authState.user = null;
		authState.loading = false;
		authState.initialized = true;
		resetCart();
	}
}

export function isLoggedIn(): boolean {
	return authState.user !== null;
}

export async function refreshUser(): Promise<User | null> {
	if (!isAuthenticated()) {
		authState.user = null;
		return null;
	}

	try {
		const user = await authApi.getProfile();
		authState.user = user;
		authState.initialized = true;
		return user;
	} catch {
		authState.user = null;
		return null;
	}
}

export async function refreshCartCount(): Promise<void> {
	await initCart();
}
