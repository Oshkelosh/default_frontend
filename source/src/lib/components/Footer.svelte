<script lang="ts">
	import type { SiteSettings } from '$lib/types';

	let { site }: { site: SiteSettings } = $props();
</script>

<footer class="shop-footer">
	<div class="container shop-footer__inner">
		<p>&copy; {new Date().getFullYear()} {site.store_name}</p>
		{#if site.support_email}
			<p><a href="mailto:{site.support_email}">{site.support_email}</a></p>
		{/if}
	</div>
</footer>

<style>
	.shop-footer {
		border-top: 1px solid var(--color-secondary-border);
		padding: 2rem 0;
		margin-top: 2rem;
		background: var(--color-secondary-subtle);
		color: var(--clr-muted);
		font-size: 0.875rem;
	}

	.shop-footer__inner {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.shop-footer p {
		margin: 0;
	}

	.shop-footer a {
		color: var(--clr-muted);
		text-decoration: none;
	}

	.shop-footer a:hover {
		color: var(--color-primary);
		text-decoration: underline;
	}
</style>
