import { listCategories } from '$lib/api/categories';
import { ApiError } from '$lib/types';

export const ssr = false;

export async function load() {
	try {
		const categories = await listCategories();
		return { categories, error: null as string | null };
	} catch (err) {
		const message =
			err instanceof ApiError ? err.message : 'Failed to load categories. Please try again later.';
		return { categories: [], error: message };
	}
}
