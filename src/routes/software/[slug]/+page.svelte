<script lang="ts">
	import type { PostMeta } from '$lib/utils/posts';
	import type { Component } from 'svelte';
	import { setupCopyButtons } from '$lib/utils/codeCopyButton';
	import SectionSidebar from '$lib/components/sectionSidebar.svelte';
	import SoftwareLeftSidebar from '$lib/components/SoftwareLeftSidebar.svelte';
	import { onMount } from 'svelte';

	let { data }: { data: { content: Component; meta: PostMeta } } = $props();

	// Progress Bar
	let scrollPercent = $state(0);

	function handleScroll() {
		const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
		const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
		scrollPercent = (winScroll / height) * 100;
	}

	onMount(() => {
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	$effect(() => {
		setupCopyButtons();
	});

	// Breadcrumbs logic
	const breadcrumbs = $derived(() => {
		const levels = ['Beginner', 'Intermediate', 'Advanced'];
		const level = data.meta.tags?.find((t) =>
			levels.includes(t.charAt(0).toUpperCase() + t.slice(1))
		);
		return [
			{ label: 'Software', href: '/software' },
			...(level ? [{ label: level, href: `/software?tag=${level.toLowerCase()}` }] : [])
		];
	});
</script>

<svelte:head>
	<title>{data.meta.title} | Blueprint</title>
	<meta name="description" content={data.meta.description || data.meta.title} />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description || ''} />
</svelte:head>

<!-- Reading Progress Bar -->
<div class="reading-progress" style="width: {scrollPercent}%" aria-hidden="true"></div>

<article class="post-page">
	<!-- Header -->
	<header class="post-header">
		<div class="post-header-bg" aria-hidden="true"></div>
		<div class="container">
			<div class="header-breadcrumb-area animate-fade-up">
				<a href="/software" class="minimal-back-btn">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<line x1="19" y1="12" x2="5" y2="12"></line>
						<polyline points="12 19 5 12 12 5"></polyline>
					</svg>
					Back to Software
				</a>
				
				<span class="breadcrumb-sep" aria-hidden="true">|</span>

				<!-- Breadcrumbs -->
				<nav class="breadcrumbs">
					{#each breadcrumbs() as crumb, i}
						<a href={crumb.href}>{crumb.label}</a>
						{#if i < breadcrumbs().length - 1}
							<span class="sep">/</span>
						{/if}
					{/each}
				</nav>
			</div>

			<h1 class="post-title animate-fade-up" style="animation-delay:120ms">
				{data.meta.title}
			</h1>

			{#if data.meta.description}
				<p class="post-description animate-fade-up" style="animation-delay:180ms">
					{data.meta.description}
				</p>
			{/if}

			<div
				class="title-rule animate-fade-up"
				style="animation-delay:300ms"
				aria-hidden="true"
			></div>
		</div>
	</header>

	<!-- Content -->
	<div class="post-body">
		<div class="post-body-inner">
			<SoftwareLeftSidebar />
			<div class="container animate-fade-up" style="animation-delay:360ms;">
					<!-- Back button moved to header -->

				<div class="prose">
					<data.content />
				</div>
			</div>
			<div class="animate-fade-up" style="animation-delay:420ms;">
				<SectionSidebar contentSelector=".prose" />
			</div>
		</div>
	</div>

	<!-- Footer nav -->
	<div class="post-footer animate-fade-up">
		<div class="container">
			<a href="/software" class="back-link">
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M19 12H5M12 5l-7 7 7 7" />
				</svg>
				Back to Software Prints
			</a>
		</div>
	</div>
</article>



<style>
	/* Progress Bar */
	.reading-progress {
		position: fixed;
		top: 0;
		left: 0;
		height: 3px;
		background: var(--gradient-accent);
		z-index: 200;
		transition: width 0.1s ease-out;
	}

	.post-header {
		position: relative;
		padding: 4rem 0 3rem;
		border-bottom: 1px solid var(--border-subtle);
		background: var(--gradient-hero);
		overflow: hidden;
	}

	.post-header-bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.post-header .container {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Breadcrumbs */
	.breadcrumbs {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.breadcrumbs a {
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.breadcrumbs a:hover {
		color: var(--text-primary);
	}

	.breadcrumbs .sep {
		opacity: 0.3;
	}

	.post-title {
		font-size: clamp(1.8rem, 5vw, 3rem);
		line-height: 1.2;
		max-width: 780px;
	}

	.post-description {
		font-size: 1.05rem;
		color: var(--text-secondary);
		max-width: 640px;
		line-height: 1.65;
	}

	.title-rule {
		height: 2px;
		background: var(--accent-cyan);
		border-radius: 2px;
		width: 60px;
		opacity: 0.6;
		margin-top: 0.5rem;
	}

	/* Body */
	.post-body {
		padding: 3.5rem 0 5rem;
	}

	.post-body-inner {
		display: flex;
		align-items: stretch;
		justify-content: center;
		gap: 3rem;
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 2rem 0 1.5rem;
	}

	/* Override container inside post-body-inner so it doesn't add extra padding */
	.post-body-inner .container {
		padding: 0;
		flex: 1;
		min-width: 0;
		max-width: 800px;
		margin: 0 auto;
	}

	/* Post footer */
	.post-footer {
		padding: 3rem 0 5rem;
		border-top: 1px solid var(--border-subtle);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-family: var(--font-mono);
		color: var(--text-muted);
		text-decoration: none;
		transition: all var(--transition-fast);
		padding: 0.5rem 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.back-link:hover {
		color: var(--text-primary);
		border-color: var(--accent-cyan);
		transform: translateX(-4px);
		background: var(--bg-card);
	}

	.header-breadcrumb-area {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		margin-bottom: 2rem;
	}

	.breadcrumb-sep {
		color: var(--border);
		font-size: 0.8rem;
		opacity: 0.6;
	}

	.minimal-back-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--text-muted);
		text-decoration: none;
		transition: all var(--transition-fast);
		padding: 0;
	}

	.minimal-back-btn:hover {
		color: var(--accent-cyan);
		transform: translateX(-4px);
	}

	.minimal-back-btn svg {
		transition: transform var(--transition-fast);
	}

	.minimal-back-btn:hover svg {
		transform: translateX(-2px);
	}
</style>
