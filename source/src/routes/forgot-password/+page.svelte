<script lang="ts">
	import { resolve } from '$app/paths';
	import AuthForm from '$lib/components/AuthForm.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { forgotPassword } from '$lib/api/auth';
	import { ApiError } from '$lib/types';

	let { data } = $props();

	let email = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);
	let submitted = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		loading = true;

		try {
			await forgotPassword(email);
			submitted = true;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Request failed. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<SeoHead title={`Forgot password | ${data.config.site.store_name}`} robots="noindex, nofollow" />

{#if submitted}
	<div class="forgot-success">
		<h1>Check your email</h1>
		<p>
			If an account exists for <strong>{email}</strong>, we sent password reset instructions.
		</p>
		<p><a href={resolve('/login')}>Back to sign in</a></p>
	</div>
{:else}
	<AuthForm title="Forgot password" submitLabel="Send reset link" {error} {loading} onsubmit={handleSubmit}>
		<label>
			<span class="field-label">Email</span>
			<input type="email" bind:value={email} required autocomplete="email" />
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
	.forgot-success {
		text-align: center;
		margin-top: 1.5rem;
		color: var(--clr-muted);
	}

	.forgot-success {
		max-width: 480px;
		margin: 0 auto;
	}
</style>
