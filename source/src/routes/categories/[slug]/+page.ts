import { getCategory } from '$lib/api/categories';
import { listProducts } from '$lib/api/products';
import { ApiError } from '$lib/types';
import { error } from '@sveltejs/kit';

export const ssr = false;

export async function load({ params, url, parent }) {
	const { config } = await parent();
	const pageSize = config.frontend.config?.products_per_page ?? 12;
	const page = Number(url.searchParams.get('page') ?? 1);

	try {
		const [category, products] = await Promise.all([
			getCategory(params.slug),
			listProducts({ category: params.slug, page, page_size: pageSize })
		]);
		return { category, products, error: null as string | null };
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			error(404, 'Category not found');
		}
		const message =
			err instanceof ApiError ? err.message : 'Failed to load category. Please try again later.';
		return {
			category: null,
			products: { items: [], total: 0, page, page_size: pageSize, pages: 0 },
			error: message
		};
	}
}
