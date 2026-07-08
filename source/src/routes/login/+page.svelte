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
