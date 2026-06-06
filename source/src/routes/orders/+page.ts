import { requireAuth } from '$lib/auth/guards';
import { listOrders } from '$lib/api/orders';
import { ApiError } from '$lib/types';

export const ssr = false;

export async function load({ url, parent }) {
	requireAuth(url.pathname);
	const { config } = await parent();
	const page = Number(url.searchParams.get('page') ?? 1);

	try {
		const orders = await listOrders({ page, page_size: 10 });
		return { config, orders, error: null as string | null };
	} catch (err) {
		const message =
			err instanceof ApiError ? err.message : 'Failed to load orders. Please try again.';
		return {
			config,
			orders: { items: [], total: 0, page, page_size: 10, pages: 0 },
			error: message
		};
	}
}
