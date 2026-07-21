/** Load an external script once and reuse the same promise. */
const loaded = new Map<string, Promise<void>>();

export function loadScript(
	src: string,
	attrs?: Record<string, string | boolean>
): Promise<void> {
	const existing = loaded.get(src);
	if (existing) return existing;

	const promise = new Promise<void>((resolve, reject) => {
		const script = document.createElement('script');
		script.src = src;
		if (attrs) {
			for (const [key, value] of Object.entries(attrs)) {
				if (value === false || value == null) continue;
				if (value === true) {
					script.setAttribute(key, '');
				} else {
					script.setAttribute(key, String(value));
				}
			}
		} else {
			script.async = true;
		}
		script.onload = () => resolve();
		script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
		document.head.appendChild(script);
	});
	loaded.set(src, promise);
	return promise;
}
