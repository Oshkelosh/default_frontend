<script lang="ts">
	import type { ShippingAddress } from '$lib/types';
	import { ISO_COUNTRIES, normalizeCountryCode } from '$lib/utils/countries';
	import { statesForCountry } from '$lib/utils/states';

	let {
		address = $bindable(),
		title = 'Address',
		required = false
	}: {
		address: ShippingAddress;
		title?: string;
		required?: boolean;
	} = $props();

	const stateOptions = $derived(statesForCountry(address.country));
	const stateRequired = $derived(required && stateOptions.length > 0);

	$effect(() => {
		const country = address.country;
		if (!country) return;
		const normalized = normalizeCountryCode(country);
		if (normalized && normalized !== country) {
			address.country = normalized;
		}
	});

	$effect(() => {
		const options = stateOptions;
		const current = address.state?.trim() ?? '';
		if (!current) return;
		if (options.length === 0) return;
		const valid = options.some((s) => s.code === current);
		if (!valid) {
			address.state = '';
		}
	});
</script>

<fieldset class="address-form">
	<legend>{title}</legend>

	<label>
		<span class="field-label">Full name</span>
		<input type="text" bind:value={address.full_name} autocomplete="name" {required} />
	</label>
	<label>
		<span class="field-label">Address line 1</span>
		<input type="text" bind:value={address.line1} autocomplete="address-line1" {required} />
	</label>
	<label>
		<span class="field-label">Address line 2</span>
		<input type="text" bind:value={address.line2} autocomplete="address-line2" />
	</label>
	<div class="address-form__row">
		<label>
			<span class="field-label">City</span>
			<input type="text" bind:value={address.city} autocomplete="address-level2" {required} />
		</label>
		<label>
			<span class="field-label">Postal code</span>
			<input type="text" bind:value={address.postal_code} autocomplete="postal-code" {required} />
		</label>
	</div>
	<div class="address-form__row">
		<label>
			<span class="field-label">Country</span>
			<select bind:value={address.country} autocomplete="country" {required}>
				<option value="" disabled={required}>
					Select country
				</option>
				{#each ISO_COUNTRIES as country (country.code)}
					<option value={country.code}>{country.name} ({country.code})</option>
				{/each}
			</select>
		</label>
		<label>
			<span class="field-label">State / Province</span>
			{#if stateOptions.length > 0}
				<select
					bind:value={address.state}
					autocomplete="address-level1"
					required={stateRequired}
				>
					<option value="" disabled={stateRequired}>Select state / province</option>
					{#each stateOptions as state (state.code)}
						<option value={state.code}>{state.name} ({state.code})</option>
					{/each}
				</select>
			{:else}
				<input type="text" bind:value={address.state} autocomplete="address-level1" />
			{/if}
		</label>
	</div>
</fieldset>

<style>
	.address-form {
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		padding: 1rem;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.address-form legend {
		font-weight: 600;
		padding: 0 0.25rem;
	}

	.field-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.375rem;
	}

	label input,
	label select {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		font: inherit;
		box-sizing: border-box;
		background: var(--clr-bg, #fff);
	}

	.address-form__row {
		display: grid;
		gap: 0.875rem;
	}

	@media (min-width: 640px) {
		.address-form__row {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
