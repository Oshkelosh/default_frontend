<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import type { SiteSettings } from '$lib/types';
	import { isPrivacyPolicyPublished } from '$lib/types';

	const STORAGE_KEY = 'oshkelosh_gdpr_dismissed';
	const DEFAULT_TEXT =
		'We use cookies and similar technologies to run this store. By continuing, you agree to our use of cookies.';

	let { site }: { site: SiteSettings } = $props();

	let dismissed = $state(browser ? localStorage.getItem(STORAGE_KEY) === '1' : false);

	const message = $derived(site.gdpr_banner_text?.trim() || DEFAULT_TEXT);
	const visible = $derived(browser && !!site.gdpr_banner_enabled && !dismissed);
	const showPrivacyLink = $derived(isPrivacyPolicyPublished(site));

	function accept() {
		localStorage.setItem(STORAGE_KEY, '1');
		dismissed = true;
	}
</script>

{#if visible}
	<div class="gdpr-banner" role="region" aria-label="Cookie notice">
		<div class="container gdpr-banner__inner">
			<p class="gdpr-banner__text">
				{message}
				{#if showPrivacyLink}
					<a href={resolve('/privacy')} class="gdpr-banner__link">Privacy policy</a>
				{/if}
			</p>
			<button type="button" class="btn btn--primary gdpr-banner__btn" onclick={accept}>Accept</button>
		</div>
	</div>
{/if}

<style>
	.gdpr-banner {
		position: fixed;
		inset-inline: 0;
		bottom: 0;
		z-index: 50;
		padding: 1rem 0;
		background: var(--clr-surface);
		border-top: 1px solid var(--color-secondary-border);
		box-shadow: 0 -4px 16px oklch(0 0 0 / 0.08);
	}

	.gdpr-banner__inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.gdpr-banner__text {
		margin: 0;
		flex: 1 1 16rem;
		font-size: 0.875rem;
		color: var(--clr-text);
		line-height: 1.45;
	}

	.gdpr-banner__link {
		margin-left: 0.35rem;
		color: var(--color-primary);
		text-decoration: underline;
		white-space: nowrap;
	}

	.gdpr-banner__btn {
		flex-shrink: 0;
	}
</style>
