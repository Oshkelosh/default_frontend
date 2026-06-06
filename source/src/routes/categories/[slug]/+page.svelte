<script lang="ts">
	import { resolve } from '$app/paths';
	import ProductGrid from '$lib/components/ProductGrid.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const layout = $derived(data.config?.frontend?.config?.layout ?? 'grid');
	const currentPage = $derived(data.products.page ?? 1);
	const totalPages = $derived(data.products.pages ?? 1);
	const category = $derived(data.category);
</script>

<svelte:head>
	{#if category}
		<title>{category.name} | {data.config.site.store_name}</title>
	{/if}
</svelte:head>

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
