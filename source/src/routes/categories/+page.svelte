<script lang="ts">
	import { resolve } from '$app/paths';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { absoluteUrl } from '$lib/utils/seo';
	import { invalidateAll } from '$app/navigation';
	let { data } = $props();

	const site = $derived(data.config.site);
</script>

<SeoHead
	title={`Categories | ${site.store_name}`}
	description={site.meta_description || `Browse categories at ${site.store_name}`}
	canonical={absoluteUrl(site, '/categories')}
	siteName={site.store_name}
	ogImage={site.logo_url}
/>

<div class="page-header">
	<h1>Categories</h1>
	<p>Shop by category</p>
</div>

{#if data.error}
	<ErrorState message={data.error} onRetry={() => invalidateAll()} />
{:else if data.categories.length === 0}
	<EmptyState message="No categories yet." />
{:else}
	<ul class="category-list">
		{#each data.categories as category (category.slug)}
			<li>
				<a href={resolve('/categories/[slug]', { slug: category.slug })}>
					<strong>{category.name}</strong>
					{#if category.description}
						<p style="margin: 0.25rem 0 0; color: var(--clr-muted); font-size: 0.875rem;">
							{category.description}
						</p>
					{/if}
				</a>
				{#if category.children && category.children.length > 0}
					<ul class="category-children">
						{#each category.children as child (child.slug)}
							<li>
								<a href={resolve('/categories/[slug]', { slug: child.slug })}>{child.name}</a>
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
