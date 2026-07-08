<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { verifyEmail } from '$lib/api/auth';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { ApiError } from '$lib/types';

	let { data } = $props();

	let status = $state<'loading' | 'success' | 'error'>('loading');
	let message = $state('');

	onMount(async () => {
		if (!data.token) {
			status = 'error';
			message = 'Missing verification token.';
			return;
		}

		try {
			const result = await verifyEmail(data.token);
			status = 'success';
			message = result.message || 'Email verified. You can now sign in.';
		} catch (err) {
			status = 'error';
			message =
				err instanceof ApiError ? err.message : 'Verification failed. The link may have expired.';
		}
	});
</script>

<SeoHead title={`Verify email | ${data.config.site.store_name}`} robots="noindex, nofollow" />

<div class="verify-page">
	{#if status === 'loading'}
		<h1>Verifying your email…</h1>
		<p>Please wait.</p>
	{:else if status === 'success'}
		<h1>Email verified</h1>
		<p>{message}</p>
		<p><a href={resolve('/login')} class="btn">Sign in</a></p>
	{:else}
		<h1>Verification failed</h1>
		<p>{message}</p>
		<p><a href={resolve('/login')}>Back to sign in</a></p>
	{/if}
</div>

<style>
	.verify-page {
		max-width: 480px;
		margin: 0 auto;
		text-align: center;
	}

	.verify-page p {
		color: var(--clr-muted);
		line-height: 1.6;
	}
</style>
