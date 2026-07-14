import { redirect } from '@sveltejs/kit';

// The site opens directly on the Software docs; there is no separate landing page.
export function load() {
	redirect(307, '/software');
}
