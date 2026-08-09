import { apiUrl } from '$lib/api/config';
import type { Product, ProductImage } from '$lib/types';
import { formatCents } from '$lib/utils/money';

export type ResolvedProductImage = {
	url: string;
	alt: string;
	sort_order: number;
	thumbUrl?: string;
	srcset?: string;
	sizes?: string;
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

function buildSrcset(image: ProductImage): string | undefined {
	const parts: string[] = [];
	const thumb = image.variants?.thumb;
	const card = image.variants?.card;
	if (thumb) parts.push(`${thumb} 256w`);
	if (card) parts.push(`${card} 800w`);
	if (image.url) parts.push(`${image.url} 2000w`);
	return parts.length > 1 ? parts.join(', ') : undefined;
}

export function getProductImages(
	product: Product,
	options?: {
		size?: 'full' | 'card' | 'thumb';
		includeSrcset?: boolean;
		sizes?: string;
	}
): ResolvedProductImage[] {
	const size = options?.size ?? 'card';
	const sorted = [...(product.images ?? [])].sort(
		(a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
	);
	const resolved: ResolvedProductImage[] = [];

	for (const [index, image] of sorted.entries()) {
		const url =
			size === 'full'
				? getProductImageUrl(image)
				: getProductImageUrl(image, size);
		if (!url) continue;
		const thumbUrl = getProductImageUrl(image, 'thumb') ?? undefined;
		const entry: ResolvedProductImage = {
			url,
			alt: image.alt_text?.trim() || product.name,
			sort_order: image.sort_order ?? index,
			thumbUrl
		};
		if (options?.includeSrcset) {
			const srcset = buildSrcset(image);
			if (srcset) {
				entry.srcset = srcset;
				entry.sizes = options.sizes ?? '(min-width: 900px) 50vw, 100vw';
			}
		}
		resolved.push(entry);
	}

	return resolved;
}

export function getPrimaryImage(product: Product): string | null {
	return getProductImages(product)[0]?.url ?? null;
}

export function getPrimaryImageAlt(product: Product): string {
	return getProductImages(product)[0]?.alt ?? product.name;
}

export function productSlug(product: Product): string {
	return product.slug || `product-${product.id}`;
}

export function isPurchasable(product: Product): boolean {
	return product.status === 'published' && product.inventory_quantity > 0;
}
