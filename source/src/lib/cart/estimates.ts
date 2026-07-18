export type EstimateDiff<T> = {
	/** Estimate map for the current items: cached entries kept, changed/new set to `loading`. */
	next: Record<number, T>;
	/** Item ids whose estimate must be (re)fetched. */
	fetchIds: number[];
	/** Item ids no longer in the cart; their in-flight requests should be invalidated. */
	removedIds: number[];
};

/**
 * Reconcile per-item shipping estimates against the current cart lines.
 * An item needs a fetch only when it is new or its quantity changed;
 * everything else keeps its cached estimate.
 */
export function diffEstimates<T>(
	current: Array<{ itemId: number; quantity: number }>,
	prevQuantities: Record<number, number>,
	prevEstimates: Record<number, T>,
	loading: T
): EstimateDiff<T> {
	const next: Record<number, T> = {};
	const fetchIds: number[] = [];
	for (const { itemId, quantity } of current) {
		const prev = prevEstimates[itemId];
		if (prev !== undefined && prevQuantities[itemId] === quantity) {
			next[itemId] = prev;
		} else {
			next[itemId] = loading;
			fetchIds.push(itemId);
		}
	}
	const currentIds = new Set(current.map((line) => line.itemId));
	const removedIds = Object.keys(prevEstimates)
		.map(Number)
		.filter((id) => !currentIds.has(id));
	return { next, fetchIds, removedIds };
}
