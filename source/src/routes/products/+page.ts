import { listProducts } from '$lib/api/products';
import { ApiError } from '$lib/types';

export const ssr = false;

export async function load({ url, parent }) {
	const { config } = await parent();
	const pageSize = config.frontend.config?.products_per_page ?? 12;
	const page = Number(url.searchParams.get('page') ?? 1);
	const search = url.searchParams.get('search') ?? undefined;
	const sort = url.searchParams.get('sort') ?? 'created_at';
	const order = (url.searchParams.get('order') ?? 'desc') as 'asc' | 'desc';

	try {
		const products = await listProducts({
			page,
			page_size: pageSize,
			search,
			sort,
			order
		});
		return { products, search: search ?? '', error: null as string | null };
	} catch (err) {
		const message =
			err instanceof ApiError ? err.message : 'Failed to load products. Please try again later.';
		return {
			products: { items: [], total: 0, page, page_size: pageSize, pages: 0 },
			search: search ?? '',
			error: message
		};
	}
}
