import { getArticlesHub } from '$lib/api/articles';
import { ApiError } from '$lib/types';

export const ssr = false;

export async function load() {
	try {
		const hub = await getArticlesHub();
		return { hub, error: null as string | null };
	} catch (err) {
		const message =
			err instanceof ApiError
				? err.status === 404
					? 'Articles are not available.'
					: err.message
				: 'Failed to load articles.';
		return { hub: null, error: message };
	}
}
