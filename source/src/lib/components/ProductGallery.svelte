<script lang="ts">
	import type { ResolvedProductImage } from '$lib/utils/product';

	let {
		images
	}: {
		images: ResolvedProductImage[];
	} = $props();

	let selectedIndex = $state(0);

	const selectedImage = $derived(images[selectedIndex] ?? null);
	const hasMultiple = $derived(images.length > 1);

	function selectImage(index: number) {
		selectedIndex = index;
	}

	function handleThumbKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			selectImage(Math.min(index + 1, images.length - 1));
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			selectImage(Math.max(index - 1, 0));
		}
	}
</script>

<div class="product-gallery">
	<div class="product-gallery__stage" aria-live="polite">
		{#if selectedImage}
			<img
				class="product-gallery__main"
				src={selectedImage.url}
				alt={selectedImage.alt}
			/>
		{:else}
			<span class="product-gallery__empty">No image available</span>
		{/if}
	</div>

	{#if hasMultiple}
		<div
			class="product-gallery__thumbs"
			role="listbox"
			aria-label="Product images"
		>
			{#each images as image, index (image.url)}
				<button
					type="button"
					class="product-gallery__thumb"
					class:product-gallery__thumb--active={index === selectedIndex}
					role="option"
					aria-selected={index === selectedIndex}
					aria-label={`View image ${index + 1} of ${images.length}`}
					onclick={() => selectImage(index)}
					onkeydown={(event) => handleThumbKeydown(event, index)}
				>
					<img src={image.url} alt="" />
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.product-gallery {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.product-gallery__stage {
		aspect-ratio: 1;
		background: oklch(0.96 0.002 264);
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.product-gallery__main {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.product-gallery__empty {
		color: var(--clr-muted);
		font-size: 0.875rem;
	}

	.product-gallery__thumbs {
		display: flex;
		gap: 0.625rem;
		overflow-x: auto;
		padding-bottom: 0.25rem;
		scrollbar-width: thin;
	}

	.product-gallery__thumb {
		flex: 0 0 4.5rem;
		width: 4.5rem;
		height: 4.5rem;
		padding: 0;
		border: 2px solid var(--clr-border);
		border-radius: calc(var(--radius) - 2px);
		background: white;
		cursor: pointer;
		overflow: hidden;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.product-gallery__thumb:hover {
		border-color: oklch(0.75 0.02 264);
	}

	.product-gallery__thumb--active {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 1px var(--color-primary);
	}

	.product-gallery__thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (min-width: 900px) {
		.product-gallery {
			display: grid;
			grid-template-columns: 4.75rem 1fr;
			grid-template-rows: auto;
			gap: 1rem;
		}

		.product-gallery__stage {
			grid-column: 2;
			grid-row: 1;
		}

		.product-gallery__thumbs {
			grid-column: 1;
			grid-row: 1;
			flex-direction: column;
			overflow-x: hidden;
			overflow-y: auto;
			max-height: min(36rem, 70vh);
			padding-bottom: 0;
			padding-right: 0.25rem;
		}

		.product-gallery__thumb {
			flex: 0 0 auto;
		}
	}
</style>
