import { requireAuth } from '$lib/auth/guards';
import { getMe } from '$lib/api/auth';
import { getCart } from '$lib/api/cart';
import { ApiError } from '$lib/types';
import type { CartItemWithPrice } from '$lib/types';

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
				lines: [] as CartItemWithPrice[],
				error: 'Your cart is empty.'
			};
		}

		return {
			config,
			cart,
			user,
			lines: cart.items,
			error: null as string | null
		};
	} catch (err) {
		const message =
			err instanceof ApiError ? err.message : 'Failed to load checkout. Please try again.';
		return {
			config,
			cart: null,
			user: null,
			lines: [] as CartItemWithPrice[],
			error: message
		};
	}
}
