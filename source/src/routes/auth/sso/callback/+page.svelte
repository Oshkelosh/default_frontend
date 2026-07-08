<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { exchangeSsoToken } from '$lib/api/sso';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { storeTokens } from '$lib/api/client';
	import { refreshUser, refreshCartCount } from '$lib/auth/session.svelte';
	import { ApiError } from '$lib/types';

	let { data } = $props();

	let status = $state<'loading' | 'success' | 'error'>('loading');
	let message = $state('');

	onMount(async () => {
		if (!data.exchangeToken) {
			status = 'error';
			message = 'Missing SSO exchange token.';
			return;
		}

		try {
			const tokens = await exchangeSsoToken(data.exchangeToken);
			storeTokens(tokens.access_token, tokens.refresh_token);
			await refreshUser();
			await refreshCartCount();
			status = 'success';
			const target = data.redirect && data.redirect.startsWith('/') ? data.redirect : '/';
			await goto(target);
		} catch (err) {
			status = 'error';
			message =
				err instanceof ApiError ? err.message : 'Social sign-in failed. Please try again.';
		}
	});
</script>

<SeoHead title={`Signing in | ${data.config.site.store_name}`} robots="noindex, nofollow" />

<div class="sso-callback">
	{#if status === 'loading'}
		<h1>Signing you in…</h1>
		<p>Please wait.</p>
	{:else if status === 'error'}
		<h1>Sign-in failed</h1>
		<p>{message}</p>
		<p><a href={resolve('/login')}>Back to sign in</a></p>
	{/if}
</div>

<style>
	.sso-callback {
		max-width: 420px;
		margin: 0 auto;
		text-align: center;
	}

	.sso-callback p {
		color: var(--clr-muted);
	}
</style>
