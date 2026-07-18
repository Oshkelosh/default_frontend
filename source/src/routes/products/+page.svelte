<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ProductGrid from '$lib/components/ProductGrid.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { absoluteUrl } from '$lib/utils/seo';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const layout = $derived(data.config?.frontend?.config?.layout ?? 'grid');
	const currentPage = $derived(data.products.page ?? 1);
	const totalPages = $derived(data.products.pages ?? 1);
	const site = $derived(data.config.site);
</script>

<SeoHead
	title={`Products | ${site.store_name}`}
	description={site.meta_description}
	canonical={absoluteUrl(site, '/products')}
	siteName={site.store_name}
	ogImage={site.logo_url}
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
