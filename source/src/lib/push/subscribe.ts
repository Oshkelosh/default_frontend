import { apiUrl } from '$lib/api/config';
import { loadScript } from './load-script';
import type { PushConfig } from '$lib/types';

declare global {
	interface Window {
		firebase?: {
			initializeApp: (config: Record<string, string>) => unknown;
			messaging: () => {
				getToken: (opts: {
					vapidKey: string;
					serviceWorkerRegistration: ServiceWorkerRegistration;
				}) => Promise<string>;
			};
		};
		OneSignalDeferred?: Array<(oneSignal: OneSignalClient) => void | Promise<void>>;
		OneSignal?: OneSignalClient;
		PusherPushNotifications?: {
			Client: new (opts: { instanceId: string }) => PusherBeamsClient;
		};
	}
}

interface OneSignalClient {
	init: (opts: { appId: string; allowLocalhostAsSecureOrigin?: boolean }) => Promise<void>;
	User: {
		PushSubscription: {
			optIn: () => Promise<void>;
			optOut: () => Promise<void>;
			id?: string | null;
		};
	};
	login?: (externalId: string) => Promise<void>;
}

interface PusherBeamsClient {
	start: () => Promise<unknown>;
	stop: () => Promise<unknown>;
	getDeviceId: () => Promise<string>;
}

function ensureNotificationSupport(): void {
	if (typeof window === 'undefined' || !('Notification' in window)) {
		throw new Error('Push notifications are not supported in this browser.');
	}
}

async function requestPermission(): Promise<void> {
	const result = await Notification.requestPermission();
	if (result !== 'granted') {
		throw new Error('Notification permission was not granted.');
	}
}

async function subscribeFcm(config: Record<string, string>): Promise<string> {
	await loadScript('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
	await loadScript('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

	if (!window.firebase) {
		throw new Error('Firebase SDK failed to load.');
	}

	const vapidKey = config.vapidKey;
	if (!vapidKey) {
		throw new Error('FCM VAPID key is missing from storefront config.');
	}

	window.firebase.initializeApp({
		apiKey: config.apiKey,
		projectId: config.projectId,
		messagingSenderId: config.messagingSenderId,
		appId: config.appId,
		authDomain: config.authDomain
	});

	const registration = await navigator.serviceWorker.register(
		apiUrl('/firebase-messaging-sw.js'),
		{ scope: '/' }
	);

	const messaging = window.firebase.messaging();
	return messaging.getToken({ vapidKey, serviceWorkerRegistration: registration });
}

async function subscribeOneSignal(config: Record<string, string>): Promise<string> {
	const appId = config.appId;
	if (!appId) {
		throw new Error('OneSignal app ID is missing from storefront config.');
	}

	window.OneSignalDeferred = window.OneSignalDeferred || [];
	const oneSignal = await new Promise<OneSignalClient>((resolve, reject) => {
		window.OneSignalDeferred?.push(async (OS) => {
			try {
				await OS.init({
					appId,
					allowLocalhostAsSecureOrigin: true
				});
				resolve(OS);
			} catch (err) {
				reject(err);
			}
		});
	});
	await loadScript('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js');
	const client = await oneSignal;

	await client.User.PushSubscription.optIn();
	const subscriptionId = client.User.PushSubscription.id;
	if (!subscriptionId) {
		throw new Error('OneSignal did not return a subscription id.');
	}
	return subscriptionId;
}

async function subscribePusherBeams(config: Record<string, string>): Promise<string> {
	const instanceId = config.instanceId;
	if (!instanceId) {
		throw new Error('Pusher Beams instance ID is missing from storefront config.');
	}

	await loadScript('https://js.pusher.com/beams/2.1.0/push-notifications-cdn.js');
	if (!window.PusherPushNotifications) {
		throw new Error('Pusher Beams SDK failed to load.');
	}

	const client = new window.PusherPushNotifications.Client({ instanceId });
	await client.start();
	return client.getDeviceId();
}

export async function subscribePush(push: PushConfig): Promise<string> {
	ensureNotificationSupport();
	await requestPermission();

	switch (push.provider) {
		case 'fcm':
			return subscribeFcm(push.config);
		case 'onesignal':
			return subscribeOneSignal(push.config);
		case 'pusher_beams':
			return subscribePusherBeams(push.config);
		default:
			throw new Error(`Unsupported push provider: ${push.provider}`);
	}
}

export async function unsubscribePush(push: PushConfig): Promise<void> {
	if (push.provider === 'onesignal' && window.OneSignal) {
		await window.OneSignal.User.PushSubscription.optOut();
	}
	if (push.provider === 'pusher_beams' && window.PusherPushNotifications) {
		// Beams client is recreated on subscribe; stop is best-effort if a page reload occurred.
		try {
			const instanceId = push.config.instanceId as string;
			if (instanceId) {
				const client = new window.PusherPushNotifications.Client({ instanceId });
				await client.stop();
			}
		} catch {
			// ignore cleanup errors
		}
	}
}
