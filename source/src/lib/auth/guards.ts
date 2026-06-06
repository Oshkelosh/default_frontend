import { redirect } from '@sveltejs/kit';
import { getStoredAccessToken } from '$lib/api/client';

export function requireAuth(currentPath: string): void {
	if (!getStoredAccessToken()) {
		const redirectTo = encodeURIComponent(currentPath);
		throw redirect(302, `/login?redirect=${redirectTo}`);
	}
}
