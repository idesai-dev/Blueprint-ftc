/**
 * Developer Mode store, persisted in sessionStorage (lasts only for the current visit).
 * Toggle via global search: "/dev3432" to enable, "/reg3432" to disable.
 */

const STORAGE_KEY = 'blueprint-dev-mode';

function getInitialState(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		return sessionStorage.getItem(STORAGE_KEY) === 'true';
	} catch {
		return false;
	}
}

export const devModeState = $state({
	active: false,
	previewMode: 'desktop' as 'desktop' | 'tablet' | 'mobile'
});

export function initDevMode() {
	devModeState.active = getInitialState();
}

export function setDevMode(val: boolean) {
	devModeState.active = val;
	if (typeof window !== 'undefined') {
		try {
			sessionStorage.setItem(STORAGE_KEY, String(val));
		} catch {
			// ignore storage errors
		}
	}
}

export function setPreviewMode(mode: 'desktop' | 'tablet' | 'mobile') {
	devModeState.previewMode = mode;
}
