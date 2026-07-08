<script lang="ts">
	import { resolve } from '$app/paths';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ProductCarousel from '$lib/components/ProductCarousel.svelte';
	import ProductGrid from '$lib/components/ProductGrid.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { absoluteUrl } from '$lib/utils/seo';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const layout = $derived(data.config?.frontend?.config?.layout ?? 'grid');
	const site = $derived(data.config.site);
	const hasContent = $derived(
		data.popularProducts.items.length > 0 || data.categorySections.length > 0
	);
</script>

<SeoHead
	title={site.store_name}
	description={site.meta_description}
	canonical={absoluteUrl(site, '/')}
/>

{#if data.error}
	<ErrorState message={data.error} onRetry={() => invalidateAll()} />
{:else if !hasContent}
	<EmptyState message="No products available yet. Check back soon!" />
{:else}
	{#if data.popularProducts.items.length > 0}
		<ProductCarousel products={data.popularProducts.items} />
	{/if}

	{#each data.categorySections as { category, products } (category.slug)}
		<section class="home-section">
			<div class="home-section__header home-section__header--centered">
				<h2 class="home-section__title">{category.name}</h2>
				<a href={resolve('/categories/[slug]', { slug: category.slug })}>View all</a>
			</div>
			<ProductGrid products={products.items} {layout} />
		</section>
	{/each}
{/if}
