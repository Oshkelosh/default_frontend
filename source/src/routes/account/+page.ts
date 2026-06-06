import { requireAuth } from '$lib/auth/guards';
import { getMe } from '$lib/api/auth';
import { ApiError } from '$lib/types';

export const ssr = false;

export async function load({ url, parent }) {
	requireAuth(url.pathname);
	const { config } = await parent();

	try {
		const user = await getMe();
		return { config, user, error: null as string | null };
	} catch (err) {
		const message =
			err instanceof ApiError ? err.message : 'Failed to load account. Please try again.';
		return { config, user: null, error: message };
	}
}
