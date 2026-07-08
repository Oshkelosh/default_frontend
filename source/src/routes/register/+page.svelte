<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import AuthForm from '$lib/components/AuthForm.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SsoButtons from '$lib/components/SsoButtons.svelte';
	import { register, login } from '$lib/auth/session.svelte';
	import { ApiError } from '$lib/types';

	let { data } = $props();

	let email = $state('');
	let password = $state('');
	let fullName = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);
	let awaitingVerification = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		loading = true;

		try {
			const user = await register({
				email,
				password,
				full_name: fullName || null
			});

			if (user.verified) {
				await login({ email, password });
				await goto(resolve('/'));
				return;
			}

			awaitingVerification = true;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<SeoHead title={`Register | ${data.config.site.store_name}`} robots="noindex, nofollow" />

{#if awaitingVerification}
	<div class="register-success">
		<h1>Check your email</h1>
		<p>
			We sent a verification link to <strong>{email}</strong>. Click the link in that email to
			activate your account, then sign in.
		</p>
		<p><a href={resolve('/login')} class="btn">Go to sign in</a></p>
	</div>
{:else}
	<AuthForm title="Create account" submitLabel="Register" {error} {loading} onsubmit={handleSubmit}>
		<label>
			<span class="field-label">Full name</span>
			<input type="text" bind:value={fullName} autocomplete="name" />
		</label>
		<label>
			<span class="field-label">Email</span>
			<input type="email" bind:value={email} required autocomplete="email" />
		</label>
		<label>
			<span class="field-label">Password</span>
			<input
				type="password"
				bind:value={password}
				required
				minlength="8"
				autocomplete="new-password"
			/>
		</label>
	</AuthForm>

	<SsoButtons providers={data.config.auth?.sso_providers ?? []} />

	<p class="auth-footer">
		Already have an account? <a href={resolve('/login')}>Sign in</a>
	</p>
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

	.auth-footer {
		text-align: center;
		margin-top: 1.5rem;
		color: var(--clr-muted);
	}

	.register-success {
		max-width: 480px;
		margin: 0 auto;
		text-align: center;
	}

	.register-success p {
		color: var(--clr-muted);
		line-height: 1.6;
	}
</style>
