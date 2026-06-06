<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import AuthForm from '$lib/components/AuthForm.svelte';
	import { registerAndLogin } from '$lib/auth/session.svelte';
	import { ApiError } from '$lib/types';

	let { data } = $props();

	let email = $state('');
	let password = $state('');
	let fullName = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		loading = true;

		try {
			await registerAndLogin({
				email,
				password,
				full_name: fullName || null
			});
			await goto(resolve('/'));
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Register | {data.config.site.store_name}</title>
</svelte:head>

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

<p class="auth-footer">
	Already have an account? <a href={resolve('/login')}>Sign in</a>
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
