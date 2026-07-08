import { getStorefrontConfig } from '$lib/api/storefront';
import { listCategories } from '$lib/api/categories';
import type { Category } from '$lib/types';

export const ssr = false;

export async function load() {
	const config = await getStorefrontConfig();
	let categories: Category[] = [];

	try {
		categories = await listCategories();
	} catch {
		categories = [];
	}

	return { config, categories };
}
