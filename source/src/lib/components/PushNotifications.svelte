<script lang="ts">
	import { updateProfile } from '$lib/api/auth';
	import { refreshUser } from '$lib/auth/session.svelte';
	import { subscribePush, unsubscribePush } from '$lib/push/subscribe';
	import type { PushConfig } from '$lib/types';
	import { ApiError } from '$lib/types';

	let {
		push,
		pushEnabled = false
	}: {
		push: PushConfig | null | undefined;
		pushEnabled?: boolean;
	} = $props();

	let loading = $state(false);
	let error = $state<string | null>(null);
	let localEnabled = $state<boolean | null>(null);
	const enabled = $derived(localEnabled ?? pushEnabled);

	async function handleEnable() {
		if (!push) return;
		loading = true;
		error = null;
		try {
			const token = await subscribePush(push);
			await updateProfile({
				push_token: token,
				push_provider: push.provider
			});
			await refreshUser();
			localEnabled = true;
		} catch (err) {
			error = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Could not enable push notifications.';
		} finally {
			loading = false;
		}
	}

	async function handleDisable() {
		if (!push) return;
		loading = true;
		error = null;
		try {
			await unsubscribePush(push);
			await updateProfile({
				push_token: null,
				push_provider: null
			});
			await refreshUser();
			localEnabled = false;
		} catch (err) {
			error = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Could not disable push notifications.';
		} finally {
			loading = false;
		}
	}
</script>

{#if push}
	<section class="push-card">
		<h2>Order notifications</h2>
		<p class="push-card__hint">
			Get browser alerts when your order is confirmed, shipped, or delivered.
		</p>

		{#if error}
			<div class="push-card__message push-card__message--error" role="alert">{error}</div>
		{/if}

		{#if enabled}
			<p class="push-card__status">Push notifications are enabled for this browser.</p>
			<button type="button" class="btn btn--secondary" disabled={loading} onclick={handleDisable}>
				{loading ? 'Updating…' : 'Disable push notifications'}
			</button>
		{:else}
			<button type="button" class="btn" disabled={loading} onclick={handleEnable}>
				{loading ? 'Enabling…' : 'Enable push notifications'}
			</button>
		{/if}
	</section>
{/if}

<style>
	.push-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-width: 560px;
		margin-bottom: 2rem;
		padding: 1.25rem;
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		background: white;
	}

	.push-card h2 {
		margin: 0;
		font-size: 1.125rem;
	}

	.push-card__hint {
		margin: 0;
		color: var(--clr-text-muted);
		font-size: 0.875rem;
	}

	.push-card__status {
		margin: 0;
		font-size: 0.875rem;
		color: oklch(0.35 0.06 145);
	}

	.push-card__message {
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		font-size: 0.875rem;
	}

	.push-card__message--error {
		background: oklch(0.95 0.04 25);
		border: 1px solid oklch(0.85 0.08 25);
		color: oklch(0.35 0.08 25);
	}

	.btn--secondary {
		background: white;
		color: var(--clr-text);
		border: 1px solid var(--clr-border);
		align-self: flex-start;
	}
</style>
