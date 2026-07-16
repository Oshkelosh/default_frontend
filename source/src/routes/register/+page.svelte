<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import AddressForm from '$lib/components/AddressForm.svelte';
	import AuthForm from '$lib/components/AuthForm.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SsoButtons from '$lib/components/SsoButtons.svelte';
	import { register } from '$lib/auth/session.svelte';
	import { ApiError } from '$lib/types';
	import type { ShippingAddress } from '$lib/types';
	import { emptyAddress } from '$lib/utils/address';

	let { data } = $props();

	let email = $state('');
	let password = $state('');
	let shippingAddress = $state(emptyAddress());
	let billingAddress = $state(emptyAddress());
	let billingSameAsShipping = $state(true);
	let error = $state<string | null>(null);
	let loading = $state(false);
	let successMessage = $state<string | null>(null);

	function addressPayload(address: ShippingAddress) {
		return {
			full_name: address.full_name?.trim() || null,
			line1: address.line1?.trim() ?? '',
			line2: address.line2?.trim() || null,
			city: address.city?.trim() ?? '',
			state: address.state?.trim() || null,
			postal_code: address.postal_code?.trim() ?? '',
			country: address.country?.trim() ?? ''
		};
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		loading = true;

		try {
			const user = await register({
				email,
				password,
				full_name: shippingAddress.full_name?.trim() || null,
				default_shipping_address: addressPayload(shippingAddress),
				billing_same_as_shipping: billingSameAsShipping,
				...(billingSameAsShipping
					? {}
					: { default_billing_address: addressPayload(billingAddress) })
			});

			const emailVerificationEnabled = data.config.auth?.email_verification_enabled ?? false;
			if (emailVerificationEnabled && !user.verified) {
				successMessage = `Account created! We sent a verification link to ${email}.`;
				return;
			}

			await goto(resolve('/'));
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function continueShopping() {
		await goto(resolve('/'));
	}
</script>

<SeoHead title={`Register | ${data.config.site.store_name}`} robots="noindex, nofollow" />

{#if successMessage}
	<div class="register-success">
		<h1>Welcome!</h1>
		<p>{successMessage}</p>
		<p class="register-success__hint">You can keep shopping while you verify your email.</p>
		<button type="button" class="btn" onclick={continueShopping}>Continue shopping</button>
	</div>
{:else}
	<AuthForm title="Create account" submitLabel="Register" {error} {loading} onsubmit={handleSubmit}>
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

		<AddressForm bind:address={shippingAddress} title="Shipping address" required />

		<label class="checkbox-label">
			<input type="checkbox" bind:checked={billingSameAsShipping} />
			<span>Billing address same as shipping</span>
		</label>

		{#if !billingSameAsShipping}
			<AddressForm bind:address={billingAddress} title="Billing address" required />
		{/if}
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

	label input:not([type='checkbox']) {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		font: inherit;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		cursor: pointer;
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

	.register-success__hint {
		font-size: 0.875rem;
	}
</style>
