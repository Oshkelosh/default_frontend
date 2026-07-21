/** Tiny checks for storefront script route gating. */
import { isPrivatePath, shouldLoadScript } from './inject-scripts';

function assert(cond: unknown, msg: string): void {
	if (!cond) throw new Error(msg);
}

assert(isPrivatePath('/account') === true, 'account is private');
assert(isPrivatePath('/account/settings') === true, 'account child is private');
assert(isPrivatePath('/orders/12') === true, 'order detail is private');
assert(isPrivatePath('/checkout') === true, 'checkout is private');
assert(isPrivatePath('/products') === false, 'products is public');
assert(isPrivatePath('/') === false, 'home is public');

assert(shouldLoadScript('all', '/products') === true, 'all on public');
assert(shouldLoadScript('all', '/account') === true, 'all on private');
assert(shouldLoadScript('public', '/products') === true, 'public on public');
assert(shouldLoadScript('public', '/account') === false, 'public not on private');
assert(shouldLoadScript('private', '/account') === true, 'private on private');
assert(shouldLoadScript('private', '/products') === false, 'private not on public');
assert(shouldLoadScript(undefined, '/products') === true, 'undefined routes = all');

console.log('inject-scripts self-check ok');
