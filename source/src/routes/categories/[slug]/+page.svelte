<script lang="ts">
	import { resolve } from '$app/paths';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ProductGrid from '$lib/components/ProductGrid.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { absoluteUrl, breadcrumbJsonLd, truncateText } from '$lib/utils/seo';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const layout = $derived(data.config?.frontend?.config?.layout ?? 'grid');
	const currentPage = $derived(data.products.page ?? 1);
	const totalPages = $derived(data.products.pages ?? 1);
	const category = $derived(data.category);
	const site = $derived(data.config.site);
	const canonical = $derived(
		category ? absoluteUrl(site, `/categories/${category.slug}`) : null
	);
</script>

{#if category}
	<SeoHead
		title={category.meta_title || `${category.name} | ${site.store_name}`}
		description={category.meta_description || truncateText(category.description, 160) || site.meta_description}
		{canonical}
		siteName={site.store_name}
		ogImage={site.logo_url}
		jsonLd={[breadcrumbJsonLd([
			{ name: 'Home', url: absoluteUrl(site, '/') },
			{ name: 'Products', url: absoluteUrl(site, '/products') },
			{ name: category.name, url: canonical ?? absoluteUrl(site, `/categories/${category.slug}`) }
		])]}
	/>
{/if}

{#if category}
	<div class="page-header">
		<h1>{category.name}</h1>
		{#if category.description}
			<p>{category.description}</p>
		{/if}
	</div>
{/if}

{#if data.error}
	<ErrorState message={data.error} onRetry={() => invalidateAll()} />
{:else if data.products.items.length === 0}
	<EmptyState message="No products in this category yet." />
{:else}
	<ProductGrid products={data.products.items} {layout} />
	<Pagination {currentPage} {totalPages} />
{/if}

<p style="margin-top: 2rem;">
	<a href={resolve('/categories')}>&larr; All categories</a>
</p>
