// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface ZarazConsent {
		modal?: boolean;
		APIReady?: boolean;
	}

	interface Zaraz {
		consent?: ZarazConsent;
	}

	interface Window {
		zaraz?: Zaraz;
	}
}

export {};
