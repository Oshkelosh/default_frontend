import { getStorefrontConfig } from '$lib/api/storefront';
import { listCategories } from '$lib/api/categories';

export const ssr = false;

export async function load() {
	const [config, categories] = await Promise.all([
		getStorefrontConfig(),
		listCategories().catch(() => [])
	]);

	return {
		config,
		categories
	};
}
