import { getProduct } from '$lib/api/products';
import { ApiError } from '$lib/types';
import { error } from '@sveltejs/kit';

export const ssr = false;

export async function load({ params }) {
	const id = Number(params.id);
	if (!Number.isFinite(id)) {
		error(404, 'Product not found');
	}

	try {
		const product = await getProduct(id);
		return { product, error: null as string | null };
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			error(404, 'Product not found');
		}
		const message =
			err instanceof ApiError ? err.message : 'Failed to load product. Please try again later.';
		return { product: null, error: message };
	}
}
