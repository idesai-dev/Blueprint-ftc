import { browser } from '$app/environment';

export type TextSize = 'default' | 'large' | 'xlarge';

function readTextSize(): TextSize {
	const saved = browser ? localStorage.getItem('a11yTextSize') : null;
	return saved === 'large' || saved === 'xlarge' ? saved : 'default';
}

function readBool(key: string): boolean {
	return browser ? localStorage.getItem(key) === 'true' : false;
}

export const a11yState = $state({
	textSize: readTextSize() as TextSize,
	reduceMotion: readBool('a11yReduceMotion'),
	highContrast: readBool('a11yHighContrast'),
	underlineLinks: readBool('a11yUnderlineLinks')
});

function applyClasses() {
	if (!browser) return;
	const root = document.documentElement;
	root.classList.remove('a11y-text-large', 'a11y-text-xlarge');
	if (a11yState.textSize === 'large') root.classList.add('a11y-text-large');
	if (a11yState.textSize === 'xlarge') root.classList.add('a11y-text-xlarge');
	root.classList.toggle('a11y-reduce-motion', a11yState.reduceMotion);
	root.classList.toggle('a11y-high-contrast', a11yState.highContrast);
	root.classList.toggle('a11y-underline-links', a11yState.underlineLinks);
}

if (browser) applyClasses();

export function setTextSize(size: TextSize) {
	a11yState.textSize = size;
	if (browser) localStorage.setItem('a11yTextSize', size);
	applyClasses();
}

export function toggleReduceMotion() {
	a11yState.reduceMotion = !a11yState.reduceMotion;
	if (browser) localStorage.setItem('a11yReduceMotion', a11yState.reduceMotion.toString());
	applyClasses();
}

export function toggleHighContrast() {
	a11yState.highContrast = !a11yState.highContrast;
	if (browser) localStorage.setItem('a11yHighContrast', a11yState.highContrast.toString());
	applyClasses();
}

export function toggleUnderlineLinks() {
	a11yState.underlineLinks = !a11yState.underlineLinks;
	if (browser) localStorage.setItem('a11yUnderlineLinks', a11yState.underlineLinks.toString());
	applyClasses();
}
