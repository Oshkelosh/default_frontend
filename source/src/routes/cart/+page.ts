import { requireAuth } from '$lib/auth/guards';
import { getCart } from '$lib/api/cart';
import { getProduct } from '$lib/api/products';
import { ApiError } from '$lib/types';
import type { CartLine } from '$lib/types';

export const ssr = false;

export async function load({ url, parent }) {
	requireAuth(url.pathname);
	const { config } = await parent();

	try {
		const cart = await getCart();
		const lines: CartLine[] = await Promise.all(
			cart.items.map(async (item) => {
				try {
					const product = await getProduct(item.product_id);
					return { item, product };
				} catch {
					return { item, product: null };
				}
			})
		);

		return { config, cart, lines, error: null as string | null };
	} catch (err) {
		const message =
			err instanceof ApiError ? err.message : 'Failed to load cart. Please try again.';
		return {
			config,
			cart: null,
			lines: [] as CartLine[],
			error: message
		};
	}
}
