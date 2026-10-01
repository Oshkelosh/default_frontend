/** Server-injected ``#seo-intro`` is present until client-side navigation. */
export const seoIntro = $state({
	present: typeof document !== 'undefined' && document.getElementById('seo-intro') != null
});
