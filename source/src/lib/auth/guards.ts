import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { isAuthenticated } from '$lib/api/client';
import { authState } from '$lib/auth/session.svelte';

export function requireAuth(returnTo?: string): void {
	if (!browser) return;
	if (authState.user || isAuthenticated()) return;

	const target = returnTo ?? window.location.pathname + window.location.search;
	const params = new URLSearchParams();
	if (target && target !== '/account') {
		params.set('returnTo', target);
	}
	const query = params.toString();
	goto(resolve('/account') + (query ? `?${query}` : ''));
}
