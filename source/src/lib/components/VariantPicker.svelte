<script lang="ts">
	import type { Product, ProductVariant } from '$lib/types';
	import { formatCents } from '$lib/utils/money';

	let {
		product,
		variants,
		selectedVariant = $bindable(null as ProductVariant | null)
	}: {
		product: Product;
		variants: ProductVariant[];
		selectedVariant?: ProductVariant | null;
	} = $props();

	const activeVariants = $derived(
		variants.filter((variant) => variant.status === 'active').sort((a, b) => a.position - b.position)
	);

	$effect(() => {
		if (!selectedVariant && activeVariants.length > 0) {
			selectedVariant = activeVariants[0];
		}
	});

	function selectVariant(variant: ProductVariant) {
		selectedVariant = variant;
	}

	function attributeKeys(): string[] {
		const keys = new Set<string>();
		for (const variant of activeVariants) {
			for (const key of Object.keys(variant.attributes ?? {})) {
				keys.add(key);
			}
		}
		return [...keys];
	}

	const hasAttributePicker = $derived(attributeKeys().length > 0 && activeVariants.length > 1);
</script>

{#if activeVariants.length > 1}
	<div class="variant-picker">
		{#if hasAttributePicker}
			{#each attributeKeys() as attribute}
				<div class="variant-picker__group">
					<p class="variant-picker__label">{attribute}</p>
					<div class="variant-picker__options">
						{#each [...new Set(activeVariants.map((variant) => variant.attributes?.[attribute]).filter(Boolean))] as value}
							{@const matching = activeVariants.filter(
								(variant) => variant.attributes?.[attribute] === value
							)}
							<button
								type="button"
								class:variant-picker__option--active={selectedVariant != null &&
									selectedVariant.attributes?.[attribute] === value}
								class="variant-picker__option"
								disabled={matching.every((variant) => variant.inventory_quantity <= 0)}
								onclick={() => selectVariant(matching[0])}
							>
								{value}
							</button>
						{/each}
					</div>
				</div>
			{/each}
		{:else}
			<p class="variant-picker__label">Choose an option</p>
			<div class="variant-picker__options">
				{#each activeVariants as variant (variant.id)}
					<button
						type="button"
						class:variant-picker__option--active={selectedVariant?.id === variant.id}
						class="variant-picker__option"
						disabled={variant.inventory_quantity <= 0}
						onclick={() => selectVariant(variant)}
					>
						{variant.title}
						<span class="variant-picker__price">{formatCents(variant.price_cents)}</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.variant-picker {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: 1rem 0;
	}

	.variant-picker__label {
		margin: 0 0 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.variant-picker__options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.variant-picker__option {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		background: var(--clr-surface, #fff);
		font: inherit;
		cursor: pointer;
	}

	.variant-picker__option--active {
		border-color: var(--color-primary);
		box-shadow: inset 0 0 0 1px var(--color-primary);
	}

	.variant-picker__option:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.variant-picker__price {
		color: var(--clr-muted);
		font-size: 0.8125rem;
	}
</style>
