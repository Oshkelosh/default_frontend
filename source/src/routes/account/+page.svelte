<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { authState, login, logout, register } from '$lib/auth/session.svelte';
	import { absoluteUrl } from '$lib/utils/seo';

	let { data } = $props();

	const site = $derived(data.config.site);
	const returnTo = $derived(page.url.searchParams.get('returnTo') ?? '/');

	let mode = $state<'login' | 'register'>('login');
	let email = $state('');
	let password = $state('');
	let fullName = $state('');
	let error = $state<string | null>(null);
	let submitting = $state(false);

	async function handleLogin(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;
		try {
			await login({ email, password });
			await goto(returnTo.startsWith('/') ? returnTo : resolve('/'));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed';
		} finally {
			submitting = false;
		}
	}

	async function handleRegister(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;
		try {
			await register({
				email,
				password,
				full_name: fullName.trim() || null
			});
			await goto(returnTo.startsWith('/') ? returnTo : resolve('/'));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Registration failed';
		} finally {
			submitting = false;
		}
	}

	async function handleLogout() {
		await logout();
		await goto(resolve('/'));
	}
</script>

<SeoHead title={`Account | ${site.store_name}`} canonical={absoluteUrl(site, '/account')} />

<div class="page-header">
	<h1>Account</h1>
</div>

{#if authState.user}
	<div class="auth-panel">
		<p>Signed in as <strong>{authState.user.email}</strong></p>
		{#if authState.user.full_name}
			<p>{authState.user.full_name}</p>
		{/if}

		<div class="auth-tabs">
			<a href={resolve('/orders')} class="btn btn--secondary">Orders</a>
			<button type="button" class="btn btn--secondary" onclick={handleLogout}>Logout</button>
		</div>
	</div>
{:else}
	<div class="auth-panel">
		<p class="cart-banner">
			Sign in or create an account to sync your cart and checkout.
		</p>

		<div class="auth-tabs">
			<button
				type="button"
				class="btn"
				class:btn--primary={mode === 'login'}
				class:btn--secondary={mode !== 'login'}
				onclick={() => (mode = 'login')}
			>
				Login
			</button>
			<button
				type="button"
				class="btn"
				class:btn--primary={mode === 'register'}
				class:btn--secondary={mode !== 'register'}
				onclick={() => (mode = 'register')}
			>
				Register
			</button>
		</div>

		{#if mode === 'login'}
			<form class="auth-form" onsubmit={handleLogin}>
				<label>
					Email
					<input type="email" bind:value={email} required autocomplete="email" />
				</label>
				<label>
					Password
					<input
						type="password"
						bind:value={password}
						required
						autocomplete="current-password"
					/>
				</label>
				<button type="submit" class="btn btn--primary" disabled={submitting}>
					{submitting ? 'Signing in…' : 'Sign in'}
				</button>
			</form>
		{:else}
			<form class="auth-form" onsubmit={handleRegister}>
				<label>
					Full name
					<input type="text" bind:value={fullName} autocomplete="name" />
				</label>
				<label>
					Email
					<input type="email" bind:value={email} required autocomplete="email" />
				</label>
				<label>
					Password
					<input
						type="password"
						bind:value={password}
						required
						minlength="8"
						autocomplete="new-password"
					/>
				</label>
				<button type="submit" class="btn btn--primary" disabled={submitting}>
					{submitting ? 'Creating account…' : 'Create account'}
				</button>
			</form>
		{/if}

		{#if error}
			<p class="product-card__error" role="alert">{error}</p>
		{/if}
	</div>
{/if}
