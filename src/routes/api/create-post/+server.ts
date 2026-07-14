import { error, json } from '@sveltejs/kit';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export const POST = async ({ request }) => {
	if (process.env.NODE_ENV === 'production') {
		throw error(403, 'Forbidden');
	}

	const { slug } = await request.json();

	if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
		throw error(400, 'Invalid slug: use only lowercase letters, numbers, and hyphens.');
	}

	const filePath = join(process.cwd(), 'src', 'posts', `${slug}.md`);

	if (existsSync(filePath)) {
		throw error(409, 'A post with that slug already exists.');
	}

	const today = new Date().toISOString().slice(0, 10);
	const stub = `---
title: ${slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
date: ${today}
description: 
tags: []
author: 
published: false
---

Start writing here...
`;

	try {
		writeFileSync(filePath, stub, 'utf-8');
		return json({ success: true, slug });
	} catch (e) {
		console.error('create-post error:', e);
		throw error(500, 'Failed to create post');
	}
};
