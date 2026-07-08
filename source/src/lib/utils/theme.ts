/** Relative luminance threshold for readable text on a solid brand color. */
const LUMINANCE_THRESHOLD = 0.55;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const normalized = hex.trim().replace(/^#/, '');
	if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
		return null;
	}

	return {
		r: parseInt(normalized.slice(0, 2), 16),
		g: parseInt(normalized.slice(2, 4), 16),
		b: parseInt(normalized.slice(4, 6), 16)
	};
}

function relativeLuminance(r: number, g: number, b: number): number {
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Returns white or near-black text for use on a solid hex background. */
export function contrastTextColor(hex: string | undefined, fallback = '#ffffff'): string {
	if (!hex) return fallback;

	const rgb = hexToRgb(hex);
	if (!rgb) return fallback;

	return relativeLuminance(rgb.r, rgb.g, rgb.b) > LUMINANCE_THRESHOLD ? '#1a1a1a' : '#ffffff';
}
