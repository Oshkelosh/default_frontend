import { apiUrl } from '$lib/api/config';
import type { Product, ProductImage } from '$lib/types';
import { formatCents } from '$lib/utils/money';

export type ResolvedProductImage = {
	url: string;
	alt: string;
	sort_order: number;
};

export function formatPrice(product: Product): string {
	const amount =
		product.price != null && product.price !== ''
			? formatCents(Math.round(Number(product.price) * 100))
			: formatCents(product.price_cents);
	return product.has_variants ? `From ${amount}` : amount;
}

export function formatComparePrice(product: Product): string | null {
	if (product.compare_at_price) {
		return formatCents(Math.round(Number(product.compare_at_price) * 100));
	}
	if (product.compare_at_price_cents != null) {
		return formatCents(product.compare_at_price_cents);
	}
	return null;
}

export function getProductImageUrl(
	image: ProductImage | undefined,
	variant?: 'card' | 'thumb'
): string | null {
	if (!image) return null;
	if (variant && image.variants?.[variant]) return image.variants[variant];
	if (image.url) return image.url;
	if (image.key) return apiUrl(`/api/v1/media/${image.key}`);
	return null;
}

export function getProductImages(product: Product): ResolvedProductImage[] {
	const sorted = [...(product.images ?? [])].sort(
		(a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
	);
	const resolved: ResolvedProductImage[] = [];

	for (const [index, image] of sorted.entries()) {
		const url = getProductImageUrl(image, 'card');
		if (!url) continue;
		resolved.push({
			url,
			alt: image.alt_text?.trim() || product.name,
			sort_order: image.sort_order ?? index
		});
	}

	return resolved;
}

export function getPrimaryImage(product: Product): string | null {
	return getProductImages(product)[0]?.url ?? null;
}

export function productSlug(product: Product): string {
	return product.slug || `product-${product.id}`;
}

export function isPurchasable(product: Product): boolean {
	return product.status === 'published' && product.inventory_quantity > 0;
}
