<script lang="ts">
	import { resolve } from '$app/paths';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import AddToCart from '$lib/components/AddToCart.svelte';
	import VariantPicker from '$lib/components/VariantPicker.svelte';
	import ProductGallery from '$lib/components/ProductGallery.svelte';
	import {
		formatComparePrice,
		formatPrice,
		getPrimaryImage,
		getProductImages,
		productSlug
	} from '$lib/utils/product';
	import { formatCents } from '$lib/utils/money';
	import {
		absoluteUrl,
		breadcrumbJsonLd,
		productDescription,
		productJsonLd,
		productTitle,
		sharedPrimaryImageUrl
	} from '$lib/utils/seo';
	import { invalidateAll } from '$app/navigation';
	import type { ProductDetail, ProductVariant } from '$lib/types';

	let { data } = $props();

	const product = $derived(data.product as ProductDetail | null);
	const site = $derived(data.config.site);
	let selectedVariant = $state<ProductVariant | null>(null);

	const images = $derived.by(() => {
		if (!product) return [];
		const variantImages = selectedVariant?.images?.length
			? selectedVariant.images
			: null;
		if (variantImages) {
			return getProductImages({ ...product, images: variantImages });
		}
		return getProductImages(product);
	});
	const imageKey = $derived(images.map((image) => image.url).join('|'));
	const imageUrl = $derived.by(() => {
		if (!product) return null;
		if (selectedVariant?.images?.length) {
			return getProductImages({ ...product, images: selectedVariant.images })[0]?.url ?? null;
		}
		return sharedPrimaryImageUrl(product) ?? getPrimaryImage(product);
	});
	const price = $derived(
		selectedVariant ? formatCents(selectedVariant.price_cents) : product ? formatPrice(product) : ''
	);
	const comparePrice = $derived(
		selectedVariant?.compare_at_price_cents != null
			? formatCents(selectedVariant.compare_at_price_cents)
			: product
				? formatComparePrice(product)
				: null
	);
	const showComparePrice = $derived(
		selectedVariant != null
			? selectedVariant.compare_at_price_cents != null &&
					selectedVariant.compare_at_price_cents > selectedVariant.price_cents
			: product != null &&
					product.compare_at_price_cents != null &&
					product.compare_at_price_cents > product.price_cents
	);
	const canonical = $derived(
		product ? absoluteUrl(site, `/products/${productSlug(product)}`) : null
	);
	const breadcrumbs = $derived(
		product
			? breadcrumbJsonLd([
					{ name: 'Home', url: absoluteUrl(site, '/') },
					{ name: 'Products', url: absoluteUrl(site, '/products') },
					{ name: product.name, url: canonical ?? absoluteUrl(site, `/products/${productSlug(product)}`) }
				])
			: null
	);
	const optionEntries = $derived(
		product?.options ? Object.entries(product.options) : []
	);
</script>

{#if product}
	<SeoHead
		title={productTitle(product, site.store_name)}
		description={productDescription(product, site.meta_description)}
		canonical={canonical}
		ogImage={imageUrl}
		ogType="product"
		jsonLd={[productJsonLd(product, site), ...(breadcrumbs ? [breadcrumbs] : [])]}
	/>
{/if}

{#if data.error}
	<ErrorState message={data.error} onRetry={() => invalidateAll()} />
{:else if product}
	<nav aria-label="Breadcrumb" class="breadcrumbs">
		<a href={resolve('/')}>Home</a>
		<span aria-hidden="true">/</span>
		<a href={resolve('/products')}>Products</a>
		<span aria-hidden="true">/</span>
		<span>{product.name}</span>
	</nav>

	<article class="product-detail">
		<div class="product-detail__gallery">
			{#key imageKey}
				<ProductGallery {images} />
			{/key}
		</div>

		<div class="product-detail__info">
			{#if product.category}
				<a
					class="product-detail__category"
					href={resolve('/categories/[slug]', { slug: product.category })}
				>
					{product.category}
				</a>
			{/if}

			<h1 class="product-detail__title">{product.name}</h1>

			<div class="product-detail__pricing">
				<p class="product-detail__price">{price}</p>
				{#if showComparePrice && comparePrice}
					<p class="product-detail__compare-price">
						<s>{comparePrice}</s>
					</p>
				{/if}
			</div>

			{#if product.variants && product.variants.length > 0}
				<VariantPicker {product} variants={product.variants} bind:selectedVariant />
			{/if}

			{#if selectedVariant}
				<div class="product-detail__purchase">
					<AddToCart {product} variant={selectedVariant} />
				</div>
				{#if selectedVariant.sku}
					<p class="product-detail__sku">SKU: {selectedVariant.sku}</p>
				{/if}
			{/if}

			{#if product.description}
				<section class="product-detail__description-block">
					<h2>Description</h2>
					<p class="product-detail__description">{product.description}</p>
				</section>
			{/if}

			{#if optionEntries.length > 0}
				<section class="product-detail__specs">
					<h2>Details</h2>
					<dl class="product-detail__spec-list">
						{#each optionEntries as [label, value]}
							<div>
								<dt>{label}</dt>
								<dd>{value}</dd>
							</div>
						{/each}
					</dl>
				</section>
			{/if}

			<p class="product-detail__back">
				<a href={resolve('/products')}>&larr; Back to products</a>
			</p>
		</div>
	</article>
{/if}

<style>
	.breadcrumbs {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
		color: var(--clr-muted, #64748b);
	}

	.product-detail__spec-list {
		display: grid;
		gap: 0.75rem;
		margin: 0;
	}

	.product-detail__spec-list dt {
		font-weight: 600;
	}

	.product-detail__spec-list dd {
		margin: 0.125rem 0 0;
		color: var(--clr-muted);
	}
</style>
