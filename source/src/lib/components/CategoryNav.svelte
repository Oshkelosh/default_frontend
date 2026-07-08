<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Category } from '$lib/types';

	let { categories }: { categories: Category[] } = $props();
</script>

<nav class="category-nav">
	<div class="container category-nav__inner">
		{#each categories as category (category.slug)}
			<a href={resolve('/categories/[slug]', { slug: category.slug })}>{category.name}</a>
		{/each}
	</div>
</nav>

<style>
	.category-nav {
		border-top: 1px solid var(--clr-border);
		background: oklch(0.98 0.002 264);
	}

	.category-nav__inner {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.25rem;
		padding: 0.625rem 0;
		font-size: 0.875rem;
	}

	.category-nav a {
		color: var(--clr-text);
		text-decoration: none;
	}

	.category-nav a:hover {
		color: var(--color-primary);
	}
</style>
