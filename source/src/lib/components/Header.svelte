<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Category, SiteSettings } from '$lib/types';
	import CategoryNav from './CategoryNav.svelte';

	let {
		site,
		categories = [],
		showCategoryNav = true
	}: {
		site: SiteSettings;
		categories?: Category[];
		showCategoryNav?: boolean;
	} = $props();
</script>

<header class="shop-header">
	<div class="container shop-header__inner">
		<a href={resolve('/')} class="shop-logo">
			{#if site.logo_url}
				<img src={site.logo_url} alt={site.store_name} class="shop-logo__img" />
			{:else}
				{site.store_name}
			{/if}
		</a>
		<nav class="shop-nav">
			<a href={resolve('/')}>Home</a>
			<a href={resolve('/products')}>Products</a>
			<a href={resolve('/categories')}>Categories</a>
		</nav>
	</div>
	{#if showCategoryNav && categories.length > 0}
		<CategoryNav {categories} />
	{/if}
</header>

<style>
	.shop-header {
		border-bottom: 1px solid var(--clr-border);
		background: white;
	}

	.shop-header__inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 0;
	}

	.shop-logo {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-primary);
		text-decoration: none;
	}

	.shop-logo__img {
		max-height: 2rem;
		width: auto;
	}

	.shop-nav {
		display: flex;
		gap: 1.25rem;
	}

	.shop-nav a {
		text-decoration: none;
		color: var(--clr-text);
		font-weight: 500;
	}

	.shop-nav a:hover {
		color: var(--color-primary);
	}
</style>
