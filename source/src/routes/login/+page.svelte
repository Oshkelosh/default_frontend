<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import AuthForm from '$lib/components/AuthForm.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SsoButtons from '$lib/components/SsoButtons.svelte';
	import { login } from '$lib/auth/session.svelte';
	import { ApiError } from '$lib/types';

	let { data } = $props();

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	const authBanner = $derived.by(() => {
		if (data.error === 'sso_failed') {
			return {
				tone: 'error' as const,
				message: 'Sign-in with the identity provider failed. Please try again.'
			};
		}
		switch (data.auth) {
			case 'verified':
				return {
					tone: 'success' as const,
					message: 'Email verified. You can sign in now.'
				};
			case 'verify_failed':
				return {
					tone: 'error' as const,
					message: 'That verification link is invalid or has expired.'
				};
			case 'password_reset':
				return {
					tone: 'success' as const,
					message: 'Password updated. Sign in with your new password.'
				};
			default:
				return null;
		}
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		loading = true;

		try {
			await login({ email, password });
			const redirectTo = data.redirect ?? '/';
			await goto(redirectTo);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Login failed. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<SeoHead title={`Login | ${data.config.site.store_name}`} robots="noindex, nofollow" />

{#if authBanner}
	<div
		class="auth-banner"
		class:auth-banner--success={authBanner.tone === 'success'}
		class:auth-banner--error={authBanner.tone === 'error'}
		role={authBanner.tone === 'error' ? 'alert' : 'status'}
	>
		{authBanner.message}
	</div>
{/if}

<AuthForm title="Login" submitLabel="Sign in" {error} {loading} onsubmit={handleSubmit}>
	<label>
		<span class="field-label">Email</span>
		<input type="email" bind:value={email} required autocomplete="email" />
	</label>
	<label>
		<span class="field-label">Password</span>
		<input type="password" bind:value={password} required autocomplete="current-password" />
	</label>
</AuthForm>

<SsoButtons
	providers={data.config.auth?.sso_providers ?? []}
	redirect={data.redirect}
/>

<p class="auth-footer">
	Don't have an account? <a href={resolve('/register')}>Register</a>
	<br />
	<a href={resolve('/forgot-password')}>Forgot password?</a>
</p>

<style>
	.auth-banner {
		max-width: 420px;
		margin: 0 auto 1rem;
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		font-size: 0.875rem;
		text-align: center;
	}

	.auth-banner--success {
		background: oklch(0.95 0.04 145);
		border: 1px solid oklch(0.85 0.06 145);
		color: oklch(0.32 0.06 145);
	}

	.auth-banner--error {
		background: oklch(0.95 0.04 25);
		border: 1px solid oklch(0.85 0.08 25);
		color: oklch(0.35 0.08 25);
	}

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

	.auth-footer {
		text-align: center;
		margin-top: 1.5rem;
		color: var(--clr-muted);
	}
</style>
