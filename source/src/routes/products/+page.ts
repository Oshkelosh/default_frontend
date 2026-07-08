import { listProducts } from '$lib/api/products';
import { ApiError } from '$lib/types';

export const ssr = false;

export async function load({ parent, url }) {
	const { config } = await parent();
	const page = Number(url.searchParams.get('page') ?? '1') || 1;
	const search = url.searchParams.get('search') ?? undefined;
	const pageSize = config.frontend.config?.products_per_page ?? 12;

	try {
		const products = await listProducts({
			page,
			page_size: pageSize,
			search,
			sort: 'created_at',
			order: 'desc',
			status: 'published'
		});
		return { config, products, search, error: null as string | null };
	} catch (err) {
		const message =
			err instanceof ApiError ? err.message : 'Failed to load products. Please try again later.';
		return {
			config,
			products: { items: [], total: 0, page: 1, page_size: pageSize, pages: 1 },
			search,
			error: message
		};
	}
}
