<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ProductGrid from '$lib/components/ProductGrid.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { absoluteUrl, itemListJsonLd } from '$lib/utils/seo';
	import { productSlug } from '$lib/utils/product';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const layout = $derived(data.config?.frontend?.config?.layout ?? 'grid');
	const currentPage = $derived(data.products.page ?? 1);
	const totalPages = $derived(data.products.pages ?? 1);
	const site = $derived(data.config.site);
	const canonical = $derived(absoluteUrl(site, '/products'));
	const productListItems = $derived(
		(data.products.items ?? []).map((product) => ({
			name: product.name,
			url: absoluteUrl(site, `/products/${productSlug(product)}`)
		}))
	);
</script>

<SeoHead
	title={`Products | ${site.store_name}`}
	description={site.meta_description}
	canonical={canonical}
	siteName={site.store_name}
	ogImage={site.logo_url}
	jsonLd={[itemListJsonLd(`Products | ${site.store_name}`, canonical, productListItems)]}
/>

<div class="page-header">
	<h1>Products</h1>
	<p>Browse our catalog</p>
</div>

{#if data.error}
	<ErrorState message={data.error} onRetry={() => invalidateAll()} />
{:else if data.products.items.length === 0}
	<EmptyState
		message={data.search ? `No products found for "${data.search}".` : 'No products available yet.'}
	/>
{:else}
	<ProductGrid products={data.products.items} {layout} />
	<Pagination {currentPage} {totalPages} />
{/if}
