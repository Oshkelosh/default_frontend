import { getArticleBySlug } from '$lib/api/articles';
import { ApiError } from '$lib/types';
import { error } from '@sveltejs/kit';

export const ssr = false;

export async function load({ params }) {
	const slug = params.slug;
	if (!slug) {
		error(404, 'Article not found');
	}

	try {
		const post = await getArticleBySlug(slug);
		return { post, error: null as string | null };
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			error(404, 'Article not found');
		}
		const message =
			err instanceof ApiError ? err.message : 'Failed to load article. Please try again later.';
		return { post: null, error: message };
	}
}
