<script lang="ts">
	import type { SsoProvider } from '$lib/types';

	let {
		providers = [],
		redirect = null
	}: {
		providers?: SsoProvider[];
		redirect?: string | null;
	} = $props();

	function authorizeHref(provider: SsoProvider): string {
		if (!redirect || redirect === '/') {
			return provider.authorize_url;
		}
		const separator = provider.authorize_url.includes('?') ? '&' : '?';
		return `${provider.authorize_url}${separator}redirect=${encodeURIComponent(redirect)}`;
	}
</script>

{#if providers.length > 0}
	<div class="sso-buttons">
		<p class="sso-buttons__divider">or sign in with</p>
		<div class="sso-buttons__list">
			{#each providers as provider (provider.id)}
				<a class="sso-buttons__btn" href={authorizeHref(provider)}>
					{provider.label}
				</a>
			{/each}
		</div>
	</div>
{/if}

<style>
	.sso-buttons {
		margin-top: 1.5rem;
	}

	.sso-buttons__divider {
		text-align: center;
		color: var(--clr-muted);
		font-size: 0.875rem;
		margin: 0 0 1rem;
		position: relative;
	}

	.sso-buttons__divider::before,
	.sso-buttons__divider::after {
		content: '';
		position: absolute;
		top: 50%;
		width: 35%;
		height: 1px;
		background: var(--clr-border);
	}

	.sso-buttons__divider::before {
		left: 0;
	}

	.sso-buttons__divider::after {
		right: 0;
	}

	.sso-buttons__list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.sso-buttons__btn {
		display: block;
		text-align: center;
		padding: 0.625rem 1rem;
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		text-decoration: none;
		color: var(--clr-text);
		font-weight: 500;
		background: white;
	}

	.sso-buttons__btn:hover {
		border-color: var(--clr-text);
	}
</style>
