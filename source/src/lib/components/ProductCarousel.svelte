<script lang="ts">
	import { tick } from 'svelte';
	import type { Product } from '$lib/types';
	import ProductCard from './ProductCard.svelte';

	const TRANSITION_MS = 750;

	type TrackSlide = {
		product: Product;
		key: string;
	};

	let {
		products,
		autoplayMs = 5000
	}: {
		products: Product[];
		autoplayMs?: number;
	} = $props();

	let trackIndex = $state(1);
	let transitionEnabled = $state(true);
	let isSnapping = $state(false);
	let stripOffset = $state(0);
	let viewportEl: HTMLDivElement | undefined = $state();
	let stripEl: HTMLDivElement | undefined = $state();
	let slideWidth = $state(280);

	const count = $derived(products.length);
	const hasMultiple = $derived(count > 1);

	const trackSlides = $derived.by((): TrackSlide[] => {
		if (count === 0) return [];
		if (count === 1) {
			return [{ product: products[0], key: `${products[0].id}-0` }];
		}
		return [
			{ product: products[count - 1], key: `${products[count - 1].id}-clone-start` },
			...products.map((product, index) => ({
				product,
				key: `${product.id}-${index}`
			})),
			{ product: products[0], key: `${products[0].id}-clone-end` }
		];
	});

	const logicalIndex = $derived.by(() => {
		if (!hasMultiple) return 0;
		if (trackIndex <= 0) return count - 1;
		if (trackIndex >= count + 1) return 0;
		return trackIndex - 1;
	});

	const transitionDuration = $derived(transitionEnabled ? TRANSITION_MS : 0);

	function measureStripOffset(index: number): number {
		if (!viewportEl || !stripEl) return 0;
		const slide = stripEl.children[index] as HTMLElement | undefined;
		if (!slide) return 0;
		return viewportEl.clientWidth / 2 - slide.offsetLeft - slide.offsetWidth / 2;
	}

	function updateStripOffset() {
		stripOffset = measureStripOffset(trackIndex);
	}

	function goToTrack(index: number) {
		if (!hasMultiple || isSnapping) return;
		transitionEnabled = true;
		trackIndex = index;
	}

	function goToLogical(index: number) {
		goToTrack(index + 1);
	}

	function goPrev() {
		goToTrack(trackIndex - 1);
	}

	function goNext() {
		goToTrack(trackIndex + 1);
	}

	async function finishSnap(nextIndex: number) {
		isSnapping = true;
		transitionEnabled = false;
		await tick();
		stripEl?.getBoundingClientRect();

		trackIndex = nextIndex;
		await tick();
		updateStripOffset();
		stripEl?.getBoundingClientRect();

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				transitionEnabled = true;
				isSnapping = false;
			});
		});
	}

	function handleStripTransitionEnd(event: TransitionEvent) {
		if (event.target !== event.currentTarget) return;
		if (event.propertyName !== 'transform' || !hasMultiple || isSnapping) return;

		if (trackIndex === count + 1) {
			void finishSnap(1);
		} else if (trackIndex === 0) {
			void finishSnap(count);
		}
	}

	$effect(() => {
		products.map((product) => product.id).join(',');
		trackIndex = hasMultiple ? 1 : 0;
		transitionEnabled = true;
		isSnapping = false;
	});

	$effect(() => {
		trackIndex;
		trackSlides.length;
		viewportEl;
		stripEl;
		updateStripOffset();
	});

	$effect(() => {
		if (!viewportEl) return;

		const updateSlideWidth = () => {
			const viewportWidth = viewportEl?.clientWidth ?? 0;
			slideWidth = Math.min(320, Math.max(180, viewportWidth * 0.38));
			updateStripOffset();
		};

		updateSlideWidth();
		const observer = new ResizeObserver(updateSlideWidth);
		observer.observe(viewportEl);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!hasMultiple || autoplayMs <= 0) return;

		const timer = setInterval(() => {
			if (!isSnapping) goNext();
		}, autoplayMs);
		return () => clearInterval(timer);
	});
</script>

{#if count > 0}
	<section
		class="product-carousel"
		class:product-carousel--snapping={isSnapping}
		aria-roledescription="carousel"
		aria-label="Popular products"
	>
		<div class="product-carousel__viewport">
			{#if hasMultiple}
				<button
					type="button"
					class="product-carousel__nav product-carousel__nav--prev"
					aria-label="Previous product"
					onclick={goPrev}
				>
					‹
				</button>
			{/if}

			<div class="product-carousel__window" bind:this={viewportEl}>
				<div
					class="product-carousel__strip"
					class:product-carousel__strip--snapping={isSnapping}
					bind:this={stripEl}
					style:--slide-width="{slideWidth}px"
					style:transform="translateX({stripOffset}px)"
					style:transition-duration="{transitionDuration}ms"
					ontransitionend={handleStripTransitionEnd}
				>
					{#each trackSlides as slide, index (slide.key)}
						<div
							class="product-carousel__slide"
							class:product-carousel__slide--active={index === trackIndex}
							aria-hidden={index !== trackIndex}
						>
							<ProductCard product={slide.product} imageLoading="eager" />
							{#if hasMultiple}
								<button
									type="button"
									class="product-carousel__slide-hit"
									class:product-carousel__slide-hit--disabled={index === trackIndex}
									tabindex={index === trackIndex ? -1 : undefined}
									aria-hidden={index === trackIndex}
									aria-label={`Show ${slide.product.name}`}
									onclick={() => goToTrack(index)}
								></button>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			{#if hasMultiple}
				<button
					type="button"
					class="product-carousel__nav product-carousel__nav--next"
					aria-label="Next product"
					onclick={goNext}
				>
					›
				</button>
			{/if}
		</div>

		{#if hasMultiple}
			<div class="product-carousel__dots" role="tablist" aria-label="Choose product">
				{#each products as product, index (product.id)}
					<button
						type="button"
						class="product-carousel__dot"
						class:product-carousel__dot--active={index === logicalIndex}
						role="tab"
						aria-selected={index === logicalIndex}
						aria-label={`Go to ${product.name}`}
						onclick={() => goToLogical(index)}
					></button>
				{/each}
			</div>
		{/if}
	</section>
{/if}

<style>
	.product-carousel {
		margin-top: 2rem;
		--carousel-ease: cubic-bezier(0.22, 1, 0.36, 1);
	}

	.product-carousel__viewport {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.product-carousel__window {
		flex: 1;
		overflow: hidden;
		min-height: 18rem;
	}

	.product-carousel__strip {
		display: flex;
		align-items: flex-end;
		gap: 1rem;
		width: max-content;
		transition-property: transform;
		transition-timing-function: var(--carousel-ease);
		will-change: transform;
	}

	.product-carousel__strip--snapping {
		transition: none !important;
	}

	.product-carousel__slide {
		position: relative;
		flex: 0 0 var(--slide-width);
		width: var(--slide-width);
		transform: scale(0.82);
		opacity: 0.68;
		transform-origin: center bottom;
		transition:
			transform 0.75s var(--carousel-ease),
			opacity 0.75s var(--carousel-ease);
	}

	.product-carousel--snapping .product-carousel__slide {
		transition: none !important;
	}

	.product-carousel__slide--active {
		transform: scale(1);
		opacity: 1;
		z-index: 1;
	}

	.product-carousel__slide-hit {
		position: absolute;
		inset: 0;
		z-index: 2;
		padding: 0;
		border: none;
		background: transparent;
		cursor: pointer;
	}

	.product-carousel__slide-hit--disabled {
		pointer-events: none;
		cursor: default;
	}

	.product-carousel__slide:not(.product-carousel__slide--active):hover :global(.product-card) {
		box-shadow: 0 4px 12px oklch(0 0 0 / 0.08);
	}

	.product-carousel__nav {
		flex-shrink: 0;
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid var(--color-secondary-border);
		border-radius: 999px;
		background: white;
		color: var(--clr-text);
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			border-color 0.2s ease,
			color 0.2s ease;
	}

	.product-carousel__nav:hover {
		border-color: var(--color-primary-border);
		color: var(--color-primary);
	}

	.product-carousel__dots {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.product-carousel__dot {
		width: 0.5rem;
		height: 0.5rem;
		padding: 0;
		border: none;
		border-radius: 999px;
		background: var(--color-secondary-border);
		cursor: pointer;
		transition:
			width 0.35s var(--carousel-ease),
			background-color 0.35s var(--carousel-ease);
	}

	.product-carousel__dot:hover:not(.product-carousel__dot--active) {
		background: var(--color-secondary-muted);
	}

	.product-carousel__dot--active {
		background: var(--color-primary);
		width: 1.25rem;
	}

	@media (max-width: 720px) {
		.product-carousel__nav {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			z-index: 3;
			background: oklch(1 0 0 / 0.92);
		}

		.product-carousel__nav--prev {
			left: 0;
		}

		.product-carousel__nav--next {
			right: 0;
		}

		.product-carousel__slide {
			transform: scale(0.76);
		}

		.product-carousel__slide--active {
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.product-carousel__strip,
		.product-carousel__slide,
		.product-carousel__dot {
			transition-duration: 0.01ms !important;
		}
	}
</style>
