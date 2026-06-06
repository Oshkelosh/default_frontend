import { listProducts } from '$lib/api/products';
import { ApiError } from '$lib/types';

export const ssr = false;

export async function load({ parent }) {
	const { config } = await parent();
	const pageSize = config.frontend.config?.products_per_page ?? 8;

	try {
		const products = await listProducts({ page_size: pageSize, sort: 'created_at', order: 'desc' });
		return { products, error: null as string | null };
	} catch (err) {
		const message =
			err instanceof ApiError ? err.message : 'Failed to load products. Please try again later.';
		return {
			products: { items: [], total: 0, page: 1, page_size: pageSize, pages: 0 },
			error: message
		};
	}
}
