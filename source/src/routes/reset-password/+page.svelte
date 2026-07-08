<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import AuthForm from '$lib/components/AuthForm.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { resetPassword } from '$lib/api/auth';
	import { ApiError } from '$lib/types';

	let { data } = $props();

	let password = $state('');
	let confirmPassword = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;

		if (!data.token) {
			error = 'Missing reset token.';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}

		loading = true;

		try {
			await resetPassword(data.token, password);
			await goto(resolve('/login'));
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Reset failed. The link may have expired.';
		} finally {
			loading = false;
		}
	}
</script>

<SeoHead title={`Reset password | ${data.config.site.store_name}`} robots="noindex, nofollow" />

{#if !data.token}
	<div class="reset-page">
		<h1>Invalid link</h1>
		<p>This password reset link is missing a token.</p>
		<p><a href={resolve('/forgot-password')}>Request a new reset link</a></p>
	</div>
{:else}
	<AuthForm title="Reset password" submitLabel="Set new password" {error} {loading} onsubmit={handleSubmit}>
		<label>
			<span class="field-label">New password</span>
			<input
				type="password"
				bind:value={password}
				required
				minlength="8"
				autocomplete="new-password"
			/>
		</label>
		<label>
			<span class="field-label">Confirm password</span>
			<input
				type="password"
				bind:value={confirmPassword}
				required
				minlength="8"
				autocomplete="new-password"
			/>
		</label>
	</AuthForm>

	<p class="auth-footer"><a href={resolve('/login')}>&larr; Back to sign in</a></p>
{/if}

<style>
	.field-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.375rem;
	}

	label input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		font: inherit;
	}

	.auth-footer,
	.reset-page {
		text-align: center;
		margin-top: 1.5rem;
		color: var(--clr-muted);
	}

	.reset-page {
		max-width: 480px;
		margin: 0 auto;
	}
</style>
