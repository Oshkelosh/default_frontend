<script lang="ts">
	import { resolve } from '$app/paths';
	import { authState } from '$lib/auth/session.svelte';
	import { getCartItemCount } from '$lib/cart/cart.svelte';
	import type { SiteSettings } from '$lib/types';
	import SearchBar from './SearchBar.svelte';

	let { site }: { site: SiteSettings } = $props();

	const itemCount = $derived(getCartItemCount());
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

		<div class="shop-header__center">
			<a href={resolve('/categories')} class="shop-header__btn">Categories</a>
			<span class="shop-header__sep" aria-hidden="true">|</span>
			<SearchBar variant="header" />
		</div>

		<nav class="shop-nav" aria-label="Account">
			<a href={resolve('/cart')} class="shop-header__btn shop-nav__cart">
				Cart
				{#if itemCount > 0}
					<span class="shop-nav__badge">{itemCount}</span>
				{/if}
			</a>

			<span class="shop-header__sep" aria-hidden="true">|</span>

			{#if authState.user}
				<a href={resolve('/account')} class="shop-header__btn">Account</a>
			{:else}
				<a href={resolve('/login')} class="shop-header__btn">Login</a>
				<a href={resolve('/register')} class="shop-header__btn">Register</a>
			{/if}
		</nav>
	</div>
</header>

<style>
	.shop-header {
		--header-bg: white;
		border-bottom: 1px solid var(--clr-border);
		background: var(--header-bg);
		box-shadow: inset 0 -3px 0 0
			linear-gradient(90deg, var(--color-primary), var(--color-secondary));
	}

	.shop-header__inner {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: center;
		padding: 1.125rem 0;
		gap: 1.5rem;
	}

	.shop-logo {
		justify-self: start;
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--clr-text);
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.shop-logo:hover {
		color: var(--color-primary);
	}

	.shop-logo__img {
		display: block;
		max-height: 2rem;
		width: auto;
	}

	.shop-header__center {
		justify-self: center;
		display: flex;
		align-items: center;
		gap: 0.875rem;
		min-width: 0;
	}

	.shop-header__sep {
		color: var(--color-secondary-border);
		font-size: 1rem;
		line-height: 1;
		user-select: none;
	}

	.shop-header__btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		padding: 0.45rem 0.8rem;
		border: none;
		border-radius: var(--radius);
		background: var(--header-bg);
		color: var(--clr-text);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		white-space: nowrap;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.shop-header__btn:hover {
		background: var(--color-secondary-subtle);
		color: var(--color-primary);
	}

	.shop-nav {
		justify-self: end;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.shop-nav__badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.125rem;
		height: 1.125rem;
		padding: 0 0.25rem;
		border-radius: 2px;
		background: var(--color-primary);
		color: var(--color-on-primary);
		font-size: 0.6875rem;
		font-weight: 700;
		line-height: 1;
	}

	@media (max-width: 768px) {
		.shop-header__inner {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.shop-logo {
			justify-self: center;
			text-align: center;
		}

		.shop-header__center {
			justify-self: stretch;
			flex-wrap: wrap;
			justify-content: center;
		}

		.shop-header__center .shop-header__sep {
			display: none;
		}

		.shop-nav {
			justify-self: center;
			justify-content: center;
		}
	}
</style>
