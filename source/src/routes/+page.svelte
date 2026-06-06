<script lang="ts">
	import { resolve } from '$app/paths';
	import ProductGrid from '$lib/components/ProductGrid.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const layout = $derived(data.config?.frontend?.config?.layout ?? 'grid');
</script>

<div class="page-header">
	<h1>Welcome to {data.config.site.store_name}</h1>
	{#if data.config.site.meta_description}
		<p>{data.config.site.meta_description}</p>
	{/if}
</div>

{#if data.error}
	<ErrorState message={data.error} onRetry={() => invalidateAll()} />
{:else if data.products.items.length === 0}
	<EmptyState message="No products available yet. Check back soon!" />
{:else}
	<ProductGrid products={data.products.items} {layout} />
	<p style="margin-top: 2rem; text-align: center;">
		<a href={resolve('/products')}>View all products &rarr;</a>
	</p>
{/if}
