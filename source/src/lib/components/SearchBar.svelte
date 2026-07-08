<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';

	let {
		initialSearch = '',
		variant = 'page'
	}: {
		initialSearch?: string;
		variant?: 'page' | 'header';
	} = $props();

	let query = $state('');

	$effect.pre(() => {
		query = initialSearch || $page.url.searchParams.get('search') || '';
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const params = new URLSearchParams($page.url.searchParams);
		if (query.trim()) {
			params.set('search', query.trim());
		} else {
			params.delete('search');
		}
		params.delete('page');
		const search = params.toString();
		goto(`${resolve('/products')}${search ? `?${search}` : ''}`);
	}
</script>

<form
	class="search-bar"
	class:search-bar--header={variant === 'header'}
	onsubmit={handleSubmit}
>
	{#if variant === 'header'}
		<div class="search-bar__field">
			<input
				type="search"
				placeholder="Search products..."
				bind:value={query}
				aria-label="Search products"
			/>
			<button type="submit" class="search-bar__inline-btn" aria-label="Search">
				<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
					<circle cx="8.75" cy="8.75" r="5.75" stroke="currentColor" stroke-width="1.5" />
					<path d="M13 13l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
		</div>
	{:else}
		<input
			type="search"
			placeholder="Search products..."
			bind:value={query}
			aria-label="Search products"
		/>
		<button type="submit">Search</button>
	{/if}
</form>

<style>
	.search-bar--header {
		margin-bottom: 0;
		flex: 1;
		min-width: 14rem;
		max-width: 24rem;
	}

	.search-bar__field {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-bar--header input {
		width: 100%;
		padding: 0.5rem 2.75rem 0.5rem 0.75rem;
		font-size: 0.9375rem;
		border: 1px solid var(--color-secondary-border);
		border-radius: var(--radius);
		background: white;
		font: inherit;
	}

	.search-bar--header input:focus {
		outline: none;
		border-color: var(--color-primary-border);
		box-shadow: 0 0 0 2px var(--color-primary-subtle);
	}

	.search-bar__inline-btn {
		position: absolute;
		right: 3px;
		top: 3px;
		bottom: 3px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		padding: 0;
		border: none;
		border-radius: calc(var(--radius) - 2px);
		background: transparent;
		color: var(--clr-muted);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.search-bar__inline-btn svg {
		width: 1rem;
		height: 1rem;
	}

	.search-bar__inline-btn:hover {
		background: var(--color-secondary-subtle);
		color: var(--clr-muted);
	}

	@media (max-width: 768px) {
		.search-bar--header {
			max-width: none;
		}
	}
</style>
