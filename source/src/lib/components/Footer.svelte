<script lang="ts">
	import type { SiteSettings } from '$lib/types';

	let { site }: { site: SiteSettings } = $props();

	const year = new Date().getFullYear();
</script>

<footer class="shop-footer">
	<div class="container">
		<p>&copy; {year} {site.store_name}. All rights reserved.</p>
		{#if site.support_email}
			<p class="shop-footer__support">
				<a href="mailto:{site.support_email}">{site.support_email}</a>
			</p>
		{/if}
	</div>
</footer>

<style>
	.shop-footer {
		padding: 2rem 0;
		text-align: center;
		color: var(--clr-muted);
		font-size: 0.875rem;
		border-top: 1px solid var(--clr-border);
		margin-top: 3rem;
	}

	.shop-footer p {
		margin: 0.25rem 0;
	}

	.shop-footer__support a {
		color: var(--color-secondary);
		text-decoration: none;
	}
</style>
