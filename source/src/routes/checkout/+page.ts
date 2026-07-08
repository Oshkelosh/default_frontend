import { requireAuth } from '$lib/auth/guards';
import { getMe } from '$lib/api/auth';
import { getCart } from '$lib/api/cart';
import { getProduct } from '$lib/api/products';
import { ApiError } from '$lib/types';
import type { CartLine } from '$lib/types';

export const ssr = false;

export async function load({ url, parent }) {
	requireAuth(url.pathname);
	const { config } = await parent();

	try {
		const [cart, user] = await Promise.all([getCart(), getMe()]);

		if (cart.items.length === 0) {
			return {
				config,
				cart,
				user,
				lines: [] as CartLine[],
				error: 'Your cart is empty.'
			};
		}

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

		return { config, cart, user, lines, error: null as string | null };
	} catch (err) {
		const message =
			err instanceof ApiError ? err.message : 'Failed to load checkout. Please try again.';
		return {
			config,
			cart: null,
			user: null,
			lines: [] as CartLine[],
			error: message
		};
	}
}
