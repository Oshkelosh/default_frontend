import { apiUrl } from '$lib/api/config';
import type { Product, ProductImage } from '$lib/types';

export function formatPrice(product: Product): string {
	if (product.price) {
		return `$${product.price}`;
	}
	return `$${(product.price_cents / 100).toFixed(2)}`;
}

export function getProductImageUrl(image: ProductImage | undefined): string | null {
	if (!image) return null;
	if (image.url) return image.url;
	if (image.key) return apiUrl(`/api/v1/media/${image.key}`);
	return null;
}

export function getPrimaryImage(product: Product): string | null {
	const images = product.images ?? [];
	if (images.length === 0) return null;
	const sorted = [...images].sort(
		(a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
	);
	return getProductImageUrl(sorted[0]);
}
