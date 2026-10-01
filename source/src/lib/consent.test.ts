// Run with: node --test src/lib/consent.test.ts (Node 22.18+ strips types natively)
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	hostBannerVisible,
	resolveCookieConsentMode,
	showCookieSettings
} from './consent.ts';

test('resolveCookieConsentMode: explicit modes', () => {
	assert.equal(resolveCookieConsentMode({ cookie_consent_mode: 'off' }), 'off');
	assert.equal(resolveCookieConsentMode({ cookie_consent_mode: 'notice' }), 'notice');
	assert.equal(resolveCookieConsentMode({ cookie_consent_mode: 'ZARAZ' }), 'zaraz');
});

test('resolveCookieConsentMode: invalid or missing falls back', () => {
	assert.equal(resolveCookieConsentMode({}), 'off');
	assert.equal(resolveCookieConsentMode({ cookie_consent_mode: 'cookiebot' }), 'off');
	assert.equal(resolveCookieConsentMode({ gdpr_banner_enabled: true }), 'notice');
	assert.equal(
		resolveCookieConsentMode({
			cookie_consent_mode: 'nope',
			gdpr_banner_enabled: true
		}),
		'notice'
	);
});

test('hostBannerVisible: notice shows until dismissed', () => {
	assert.equal(
		hostBannerVisible({
			mode: 'notice',
			dismissed: false,
			zarazReady: false,
			zarazTimedOut: false
		}),
		true
	);
	assert.equal(
		hostBannerVisible({
			mode: 'notice',
			dismissed: true,
			zarazReady: false,
			zarazTimedOut: false
		}),
		false
	);
});

test('hostBannerVisible: off never shows', () => {
	assert.equal(
		hostBannerVisible({
			mode: 'off',
			dismissed: false,
			zarazReady: false,
			zarazTimedOut: true
		}),
		false
	);
});

test('hostBannerVisible: zaraz waits then falls back; hides when CMP ready', () => {
	assert.equal(
		hostBannerVisible({
			mode: 'zaraz',
			dismissed: false,
			zarazReady: false,
			zarazTimedOut: false
		}),
		false
	);
	assert.equal(
		hostBannerVisible({
			mode: 'zaraz',
			dismissed: false,
			zarazReady: false,
			zarazTimedOut: true
		}),
		true
	);
	assert.equal(
		hostBannerVisible({
			mode: 'zaraz',
			dismissed: false,
			zarazReady: true,
			zarazTimedOut: true
		}),
		false
	);
	assert.equal(
		hostBannerVisible({
			mode: 'zaraz',
			dismissed: true,
			zarazReady: false,
			zarazTimedOut: true
		}),
		false
	);
});

test('showCookieSettings: only zaraz', () => {
	assert.equal(showCookieSettings('off'), false);
	assert.equal(showCookieSettings('notice'), false);
	assert.equal(showCookieSettings('zaraz'), true);
});
