import type { Product, ProductDetail, ProductVariant, SiteSettings } from '$lib/types';
import { DEFAULT_CURRENCY } from '$lib/utils/money';

export function absoluteUrl(site: SiteSettings, path: string): string {
	const base = site.site_url?.replace(/\/$/, '') ?? '';
	if (!base) return path;
	return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function truncateText(value: string | null | undefined, maxLength: number): string | null {
	if (!value) return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (trimmed.length <= maxLength) return trimmed;
	return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export function organizationJsonLd(site: SiteSettings): Record<string, unknown> {
	const payload: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: site.store_name,
		url: absoluteUrl(site, '/')
	};
	if (site.logo_url) {
		payload.logo = site.logo_url;
	}
	return payload;
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url
		}))
	};
}

export function productTitle(product: Product, storeName: string): string {
	return product.meta_title?.trim() || `${product.name} | ${storeName}`;
}

export function productDescription(
	product: Product,
	fallback?: string | null
): string | undefined {
	return (
		product.meta_description?.trim() ||
		truncateText(product.description, 160) ||
		fallback ||
		undefined
	);
}

function formatPriceCents(cents: number): string {
	return (cents / 100).toFixed(2);
}

function availabilityUrl(inStock: boolean): string {
	return inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
}

function activeVariants(variants: ProductVariant[] | undefined): ProductVariant[] {
	return (variants ?? [])
		.filter((variant) => variant.status === 'active')
		.sort((a, b) => a.position - b.position || a.id - b.id);
}

export function buildProductOffersJsonLd(
	product: Product,
	site: SiteSettings,
	variants: ProductVariant[] | undefined
): Record<string, unknown> {
	const productUrl = absoluteUrl(site, `/products/${product.slug ?? product.id}`);
	const active = activeVariants(variants);

	if (product.has_variants && active.length > 1) {
		const prices = active.map((variant) => variant.price_cents);
		const inStock = active.some((variant) => variant.inventory_quantity > 0);
		return {
			'@type': 'AggregateOffer',
			lowPrice: formatPriceCents(Math.min(...prices)),
			highPrice: formatPriceCents(Math.max(...prices)),
			priceCurrency: site.shop_currency || DEFAULT_CURRENCY,
			offerCount: active.length,
			availability: availabilityUrl(inStock),
			url: productUrl
		};
	}

	const variant = active[0];
	const priceCents = variant?.price_cents ?? product.price_cents;
	const inventory = variant?.inventory_quantity ?? product.inventory_quantity;
	return {
		'@type': 'Offer',
		priceCurrency: site.shop_currency || DEFAULT_CURRENCY,
		price: formatPriceCents(priceCents),
		availability: availabilityUrl(inventory > 0),
		url: productUrl
	};
}

export function productJsonLd(
	product: ProductDetail,
	site: SiteSettings,
	imageUrl?: string | null
): Record<string, unknown> {
	const active = activeVariants(product.variants);
	const sku = active.length === 1 && active[0].sku ? active[0].sku : product.sku ?? undefined;
	const image = imageUrl ?? sharedPrimaryImageUrl(product);

	const payload: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.name,
		description: productDescription(product),
		sku,
		offers: buildProductOffersJsonLd(product, site, product.variants),
		url: absoluteUrl(site, `/products/${product.slug ?? product.id}`)
	};
	if (image) {
		payload.image = [image];
	}
	return payload;
}

export function sharedPrimaryImageUrl(product: Product): string | null {
	const sorted = [...(product.images ?? [])].sort(
		(a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
	);
	const shared = sorted.find((image) => image.variant_id == null && image.url);
	if (shared?.url) return shared.url;
	return sorted.find((image) => image.url)?.url ?? null;
}
