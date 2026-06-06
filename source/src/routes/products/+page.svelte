<script lang="ts">
	import ProductGrid from '$lib/components/ProductGrid.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const layout = $derived(data.config?.frontend?.config?.layout ?? 'grid');
	const currentPage = $derived(data.products.page ?? 1);
	const totalPages = $derived(data.products.pages ?? 1);
</script>

<div class="page-header">
	<h1>Products</h1>
	<p>Browse our catalog</p>
</div>

{#key data.search}
	<SearchBar initialSearch={data.search} />
{/key}

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
