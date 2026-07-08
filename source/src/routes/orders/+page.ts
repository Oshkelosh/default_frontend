import { requireAuth } from '$lib/auth/guards';
import { listOrders } from '$lib/api/orders';
import { ApiError } from '$lib/types';

export const ssr = false;

export async function load({ parent, url }) {
	requireAuth(url.pathname);
	const { config } = await parent();

	try {
		const orders = await listOrders();
		return { config, orders, error: null as string | null };
	} catch (err) {
		const message =
			err instanceof ApiError ? err.message : 'Failed to load orders. Please try again.';
		return {
			config,
			orders: { items: [], total: 0, page: 1, page_size: 20, pages: 1 },
			error: message
		};
	}
}
