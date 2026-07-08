import { error } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/guards';
import { getOrder } from '$lib/api/orders';
import { ApiError } from '$lib/types';

export const ssr = false;

export async function load({ params, url, parent }) {
	requireAuth(url.pathname);
	const { config } = await parent();
	const orderId = Number(params.id);

	if (Number.isNaN(orderId)) {
		throw error(404, 'Order not found');
	}

	try {
		const order = await getOrder(orderId);
		const checkoutMock = url.searchParams.get('checkout') === 'mock';
		const paymentReturn = url.searchParams.get('payment') === 'return';
		return { config, order, checkoutMock, paymentReturn, error: null as string | null };
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			throw error(404, 'Order not found');
		}
		const message =
			err instanceof ApiError ? err.message : 'Failed to load order. Please try again.';
		return { config, order: null, checkoutMock: false, paymentReturn: false, error: message };
	}
}
