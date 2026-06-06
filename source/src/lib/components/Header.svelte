<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import type { Category, SiteSettings } from '$lib/types';
	import CategoryNav from './CategoryNav.svelte';
	import {
		authState,
		logout as sessionLogout
	} from '$lib/auth/session.svelte';

	let {
		site,
		categories = [],
		showCategoryNav = true
	}: {
		site: SiteSettings;
		categories?: Category[];
		showCategoryNav?: boolean;
	} = $props();

	async function handleLogout() {
		await sessionLogout();
		await goto(resolve('/'));
	}
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

			<span class="shop-nav__divider" aria-hidden="true"></span>

			{#if authState.user}
				<a href={resolve('/account')}>Account</a>
				<a href={resolve('/orders')}>Orders</a>
				<a href={resolve('/cart')} class="shop-nav__cart">
					Cart
					{#if authState.cartItemCount > 0}
						<span class="shop-nav__badge">{authState.cartItemCount}</span>
					{/if}
				</a>
				<button type="button" class="shop-nav__link-btn" onclick={handleLogout}>Logout</button>
			{:else}
				<a href={resolve('/login')}>Login</a>
				<a href={resolve('/register')}>Register</a>
			{/if}
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
		gap: 1rem;
	}

	.shop-logo {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-primary);
		text-decoration: none;
		flex-shrink: 0;
	}

	.shop-logo__img {
		max-height: 2rem;
		width: auto;
	}

	.shop-nav {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
	}

	.shop-nav a,
	.shop-nav__link-btn {
		text-decoration: none;
		color: var(--clr-text);
		font-weight: 500;
	}

	.shop-nav a:hover,
	.shop-nav__link-btn:hover {
		color: var(--color-primary);
	}

	.shop-nav__divider {
		width: 1px;
		height: 1.25rem;
		background: var(--clr-border);
	}

	.shop-nav__cart {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.shop-nav__badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.25rem;
		border-radius: 999px;
		background: var(--color-primary);
		color: white;
		font-size: 0.6875rem;
		font-weight: 700;
		line-height: 1;
	}

	.shop-nav__link-btn {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
	}
</style>
