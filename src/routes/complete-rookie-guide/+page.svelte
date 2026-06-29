<script lang="ts">
	import { formatDate, tagColor } from '$lib/utils/posts';
	import type { PostMeta } from '$lib/utils/posts';
	import type { Component } from 'svelte';
	import { fade } from 'svelte/transition';
	import PortfolioReview from '$lib/components/PortfolioReview.svelte';
	import { setupCopyButtons } from '$lib/utils/codeCopyButton';
	import SectionSidebar from '$lib/components/sectionSidebar.svelte';
	import LeftSidebar from '$lib/components/SoftwareLeftSidebar.svelte';
	let { data }: { data: { content: Component; meta: PostMeta } } = $props();

	$effect(() => {
		setupCopyButtons();
	});
</script>

<svelte:head>
	<title>{data.meta.title} | Blueprint</title>
	<meta name="description" content={data.meta.description || data.meta.title} />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description || ''} />
</svelte:head>

<article class="post-page">
	<!-- Header -->
	<header class="post-header">
		<div class="post-header-bg" aria-hidden="true"></div>
		<div class="container">
			<a href="/" class="back-link animate-fade-up">
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
				Back to home
			</a>

			<div class="post-meta animate-fade-up" style="animation-delay:60ms">
				<time class="date" datetime={data.meta.date}>{formatDate(data.meta.date)}</time>
				{#if data.meta.author}
					<span class="meta-sep">·</span>
					<span class="author">{data.meta.author}</span>
				{/if}
			</div>

			<h1 class="post-title animate-fade-up" style="animation-delay:120ms">
				{data.meta.title}
			</h1>

			{#if data.meta.description}
				<p class="post-description animate-fade-up" style="animation-delay:180ms">
					{data.meta.description}
				</p>
			{/if}

			{#if data.meta.tags && data.meta.tags.length > 0}
				<div class="post-tags animate-fade-up" style="animation-delay:240ms">
					{#each data.meta.tags as tag, i}
						<span class="tag {tagColor(tag)}">{tag}</span>
					{/each}
				</div>
			{/if}

			<div
				class="title-rule animate-fade-up"
				style="animation-delay:300ms"
				aria-hidden="true"
			></div>
		</div>
	</header>

	<!-- Content -->
	<div class="post-body animate-fade-up" style="animation-delay:360ms;">
		<div class="post-body-inner">
			<LeftSidebar />
			<div class="container">
				<div class="prose">
					<data.content />
				</div>
				<PortfolioReview />
			</div>
			<div class="sidebar-stretch">
				<SectionSidebar contentSelector=".prose" />
			</div>
		</div>
	</div>

	<!-- Footer nav -->
	<div class="post-footer animate-fade-up">
		<div class="container">
			<a href="/" class="back-link">
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
				Back to home
			</a>
		</div>
	</div>
</article>

<style>
	/* Header */
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

	.header-orb {
		position: absolute;
		width: 600px;
		height: 300px;
		top: -150px;
		right: -100px;
		background: radial-gradient(ellipse, rgba(116, 215, 237, 0.08) 0%, transparent 60%);
		border-radius: 50%;
		filter: blur(40px);
	}

	.post-header .container {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.82rem;
		font-family: var(--font-mono);
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--transition-fast);
		width: fit-content;
	}

	.back-link:hover {
		color: var(--text-primary);
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8rem;
		font-family: var(--font-mono);
		color: var(--text-muted);
	}

	.meta-sep {
		opacity: 0.4;
	}
	.author {
		color: var(--accent-green);
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

	.post-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.title-rule {
		height: 2px;
		background: var(--gradient-accent);
		border-radius: 2px;
		width: 60px;
		opacity: 0.6;
		margin-top: 0.5rem;
	}

	.sidebar-stretch {
		align-self: stretch;
	}

	/* Body */
	.post-body {
		padding: 3.5rem 0 4rem;
	}

	.post-body-inner {
		display: flex;
		align-items: flex-start;
		gap: 3rem;
		max-width: calc(var(--container-max) + 220px + 3rem);
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	/* Override container inside post-body-inner so it doesn't add extra padding */
	.post-body-inner .container {
		padding: 0;
		flex: 1;
		min-width: 0;
	}

	/* Post footer */
	.post-footer {
		padding: 2rem 0 4rem;
		border-top: 1px solid var(--border-subtle);
	}
</style>
