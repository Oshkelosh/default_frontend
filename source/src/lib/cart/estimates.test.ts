// Run with: node --test src/lib/cart/estimates.test.ts (Node 22.18+ strips types natively)
import test from 'node:test';
import assert from 'node:assert/strict';
import { diffEstimates } from './estimates.ts';

const LOADING = 'loading';

test('only the changed item is refetched; others keep cached estimates', () => {
	const { next, fetchIds, removedIds } = diffEstimates(
		[
			{ itemId: 1, quantity: 3 },
			{ itemId: 2, quantity: 1 }
		],
		{ 1: 2, 2: 1 },
		{ 1: 'est-1', 2: 'est-2' },
		LOADING
	);
	assert.deepEqual(fetchIds, [1]);
	assert.deepEqual(removedIds, []);
	assert.deepEqual(next, { 1: LOADING, 2: 'est-2' });
});

test('new item is fetched, existing item untouched', () => {
	const { next, fetchIds, removedIds } = diffEstimates(
		[
			{ itemId: 1, quantity: 2 },
			{ itemId: 3, quantity: 1 }
		],
		{ 1: 2 },
		{ 1: 'est-1' },
		LOADING
	);
	assert.deepEqual(fetchIds, [3]);
	assert.deepEqual(removedIds, []);
	assert.deepEqual(next, { 1: 'est-1', 3: LOADING });
});

test('removed item is dropped and reported for invalidation', () => {
	const { next, fetchIds, removedIds } = diffEstimates(
		[{ itemId: 2, quantity: 1 }],
		{ 1: 2, 2: 1 },
		{ 1: 'est-1', 2: 'est-2' },
		LOADING
	);
	assert.deepEqual(fetchIds, []);
	assert.deepEqual(removedIds, [1]);
	assert.deepEqual(next, { 2: 'est-2' });
});

test('item still loading (no cached estimate) with same quantity is refetched', () => {
	const { fetchIds } = diffEstimates([{ itemId: 1, quantity: 2 }], { 1: 2 }, {}, LOADING);
	assert.deepEqual(fetchIds, [1]);
});
