<script lang="ts">
	import { resolve } from '$app/paths';
	import type { SiteSettings } from '$lib/types';
	import { isAboutPagePublished, isPrivacyPolicyPublished } from '$lib/types';

	let { site }: { site: SiteSettings } = $props();

	const showAboutLink = $derived(isAboutPagePublished(site));
	const showPrivacyLink = $derived(isPrivacyPolicyPublished(site));
</script>

<footer class="shop-footer">
	<div class="container shop-footer__inner">
		<p>&copy; {new Date().getFullYear()} {site.store_name} | Powered by <a href="https://github.com/oshkelosh" target="_blank" rel="noopener noreferrer">Oshkelosh</a></p>
		<div class="shop-footer__links">
			{#if showAboutLink}
				<a href={resolve('/about')}>About</a>
			{/if}
			{#if showPrivacyLink}
				<a href={resolve('/privacy')}>Privacy policy</a>
			{/if}
			{#if site.support_email}
				<a href="mailto:{site.support_email}">{site.support_email}</a>
			{/if}
		</div>
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

	.shop-footer__links {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
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
