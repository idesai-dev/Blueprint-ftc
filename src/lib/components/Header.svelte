<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from './ThemeToggle.svelte';
	import { fade } from 'svelte/transition';
	import { cursorState, toggleCursor } from '$lib/stores/cursor.svelte';
	import { devModeState, setDevMode, initDevMode, setPreviewMode } from '$lib/stores/devMode.svelte';
	import { goto } from '$app/navigation';
	import toast from 'svelte-5-french-toast';
	import { onMount } from 'svelte';

	let isSandboxChild = $state(false);

	let showCursorOnboarding = $state(false);

	onMount(() => {
		initDevMode();
		isSandboxChild = window.location.search.includes('sandbox=true');
		
		const hasSeenOnboarding = localStorage.getItem('cursorOnboardingSeen');
		const isDesktop = typeof window !== 'undefined' && window.innerWidth > 1024;
		
		if (!hasSeenOnboarding && isDesktop) {
			setTimeout(() => {
				showCursorOnboarding = true;
				// Auto-hide after 40 seconds
				setTimeout(dismissOnboarding, 40000);
			}, 1000);
		}

		window.addEventListener('clearHeaderSearch', () => {
			displayQuery = '';
			actualQuery = '';
		});
		if (typeof navigator !== 'undefined') {
			isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform) || /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
		}
	});

	let displayQuery = $state('');
	let actualQuery = $state('');

	function handleHeaderInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const val = target.value;

		if ($page.url.pathname === '/search') {
			// Sync what they typed down to the main page!
			displayQuery = ''; 
			actualQuery = '';
			document.getElementById('main-search-input')?.focus();
			// Dispatch event so main page can append/set this char
			window.dispatchEvent(new CustomEvent('headerToMainSearchSync', { detail: val }));
			return;
		}

		if (val.startsWith('/dev') || val.startsWith('/reg')) {
			const prefix = val.substring(0, 4);
			const typedSuffix = val.substring(4);
			const realSuffix = actualQuery.length > 4 ? actualQuery.substring(4) : '';

			if (typedSuffix.length > realSuffix.length) {
				const addedStr = typedSuffix.slice(-(typedSuffix.length - realSuffix.length));
				actualQuery = prefix + realSuffix + addedStr;
			} else if (typedSuffix.length < realSuffix.length) {
				actualQuery = prefix + realSuffix.slice(0, typedSuffix.length);
			} else {
				actualQuery = val;
			}
			displayQuery = prefix + '*'.repeat(Math.max(0, actualQuery.length - 4));
			target.value = displayQuery;
		} else {
			actualQuery = val;
			displayQuery = val;
		}
	}

	function handleHeaderFocus() {
		if ($page.url.pathname === '/search') {
			document.getElementById('main-search-input')?.focus();
		}
	}

	let headerSearchInput = $state<HTMLInputElement | null>(null);
	let isMac = $state(true);

	function handleWindowKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			if ($page.url.pathname === '/search') {
				document.getElementById('main-search-input')?.focus();
			} else {
				headerSearchInput?.focus();
			}
		}
	}

	type NavLink = {
		label: string;
		href?: string;
		devOnly?: boolean;
		children?: NavLink[];
	};

	const navLinks: NavLink[] = [
		{ href: '/', label: 'Home' },
		{ href: '/complete-rookie-guide', label: 'Rookie Guide', devOnly: true},
		{ href: '/software', label: 'Software'},
		{
			label: 'Simulators',
			children: [
				{ href: '/simulators/model-converter', label: 'Model Converter', devOnly: true },
				{ href: '/simulators/pid', label: 'PID Simulator' },
				{ href: '/simulators/motionprofile', label: 'Motion Profiling' },
				{ href: '/simulators/feedforward', label: 'Feedforward' },
				{ href: '/simulators/pid-game', label: 'PID Learning Game' },
				{ href: '/simulators/pedro-visualizer', label: 'Pedro Visualizer' },
				{ href: '/simulators/mecanum', label: 'Mecanum Simulator' },
				{ href: '/software/markdown-reference', label: 'Markdown Reference', devOnly: true }
			]
		},
		{ href: '/hardware', label: 'Hardware', devOnly: true},
		{ href: '/outreach', label: 'Outreach', devOnly: true},
		{ href: '/editor', label: 'Editor', devOnly: true},
		{ href: '/review', label: 'Review' },
		{ href: '/suggest', label: 'Suggest' },

		{ href: '/about', label: 'About' }
	];

	const visibleNavLinks = $derived(
		navLinks
			.filter((item) => !item.devOnly || devModeState.active)
			.map((item) => {
				if (item.children) {
					return {
						...item,
						children: item.children.filter((child) => !child.devOnly || devModeState.active)
					};
				}
				return item;
			})
	);

	let menuOpen = $state(false);
	let simulatorsOpen = $state(false);

	function closeMenu() {
		menuOpen = false;
		simulatorsOpen = false;
	}

	function dismissOnboarding() {
		showCursorOnboarding = false;
		localStorage.setItem('cursorOnboardingSeen', 'true');
	}

	function handleSearchSubmit(e: Event) {
		e.preventDefault();
		if (actualQuery.trim()) {
			const q = actualQuery.trim();
			if (q === '/dev3432') {
				setDevMode(true);
				toast.success('Developer Mode Enabled');
				displayQuery = '';
				actualQuery = '';
				return;
			}
			if (q === '/reg3432') {
				setDevMode(false);
				toast.success('Regular Mode Enabled');
				displayQuery = '';
				actualQuery = '';
				return;
			}
			goto(`/search?q=${encodeURIComponent(q)}`);
			displayQuery = '';
			actualQuery = '';
		}
	}

	const isSimulatorActive = () =>
		[
			'/simulators/pid',
			'/simulators/motionprofile',
			'/simulators/feedforward',
			'/simulators/pedro-visualizer',
			'/simulators/mecanum'
		].some((path) => $page.url.pathname === path || $page.url.pathname.startsWith(`${path}/`));
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<header class="header" class:scrolled={false}>
	<div class="inner" class:dev-mode-active={devModeState.active}>
		<a href="/" class="logo" onclick={closeMenu}>
			<span class="logo-mark">⬡</span>
			<span class="logo-text">Blueprint</span>
		</a>

		<nav class="nav" class:open={menuOpen} aria-label="Main navigation">
			{#each visibleNavLinks as item}
				{#if item.children}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="nav-dropdown"
						class:open={simulatorsOpen}
						onmouseenter={() => { if (typeof window !== 'undefined' && window.innerWidth > 1024) simulatorsOpen = true; }}
						onmouseleave={() => { if (typeof window !== 'undefined' && window.innerWidth > 1024) simulatorsOpen = false; }}
					>
						<button
							type="button"
							class="nav-link dropdown-toggle"
							class:active={isSimulatorActive()}
							aria-expanded={simulatorsOpen}
							aria-haspopup="true"
							onclick={() => (simulatorsOpen = !simulatorsOpen)}
						>
							{item.label}
							<span class="chevron">▾</span>
						</button>

						<div class="dropdown-menu">
							{#each item.children as child}
								<a
									href={child.href}
									class="dropdown-link"
									class:active={$page.url.pathname === child.href}
									aria-current={$page.url.pathname === child.href ? 'page' : undefined}
									onclick={closeMenu}
								>
									{child.label}
								</a>
							{/each}
						</div>
					</div>
				{:else}
					<a
						href={item.href}
						class="nav-link"
						class:active={$page.url.pathname === item.href ||
							($page.url.pathname.startsWith('/software') && item.href === '/software')}
						aria-current={$page.url.pathname === item.href ? 'page' : undefined}
						onclick={closeMenu}
					>
						{item.label}
					</a>
				{/if}
			{/each}
		</nav>

		<div class="actions">
			<form class="header-search-wrap" onsubmit={handleSearchSubmit}>
				<svg
					class="search-icon"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
				</svg>
				<input
					bind:this={headerSearchInput}
					type="search"
					placeholder="Global Search..."
					bind:value={displayQuery}
					oninput={handleHeaderInput}
					onfocus={handleHeaderFocus}
					class="header-search-input"
				/>
				{#if devModeState.active}
					<span class="dev-badge">DEV</span>
				{:else}
					<span class="search-cmd">{isMac ? '⌘K' : 'Ctrl K'}</span>
				{/if}
			</form>

			<a href="/search" class="action-btn mobile-search-btn" aria-label="Search" title="Search">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
				</svg>
			</a>

			{#if devModeState.active && !isSandboxChild}
				<div class="viewport-toggle">
					<button class="view-btn" class:active={devModeState.previewMode === 'desktop'} onclick={() => setPreviewMode('desktop')} title="Desktop View">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
					</button>
					<button class="view-btn" class:active={devModeState.previewMode === 'tablet'} onclick={() => setPreviewMode('tablet')} title="Tablet View">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
					</button>
					<button class="view-btn" class:active={devModeState.previewMode === 'mobile'} onclick={() => setPreviewMode('mobile')} title="Mobile View">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
					</button>
				</div>
			{/if}

			<div class="cursor-toggle-wrapper">
				<button
					class="action-btn cursor-toggle"
					class:active={cursorState.active}
					onclick={() => { toggleCursor(); dismissOnboarding(); }}
					title="Toggle Custom Cursor"
				>
					{#if cursorState.active}
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="m13 13 6 6" />
						</svg>
					{:else}
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
						</svg>
					{/if}
				</button>

				{#if showCursorOnboarding}
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
					<div class="cursor-onboarding" transition:fade onclick={dismissOnboarding}>
						<p>Toggle custom cursor here for less lag</p>
						<button class="dismiss-btn" onclick={(e) => { e.stopPropagation(); dismissOnboarding(); }}>✕</button>
						<div class="arrow"></div>
					</div>
				{/if}
			</div>

			<ThemeToggle />

			<button
				class="menu-btn"
				aria-label="Toggle menu"
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
			>
				<span class="bar" class:open={menuOpen}></span>
				<span class="bar" class:open={menuOpen}></span>
				<span class="bar" class:open={menuOpen}></span>
			</button>
		</div>
	</div>
</header>

{#if menuOpen}
	<div
		class="backdrop"
		role="button"
		tabindex="-1"
		aria-label="Close menu"
		onclick={closeMenu}
		onkeydown={(e) => e.key === 'Enter' && closeMenu()}
	></div>
{/if}

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 100;
		height: var(--header-height);
		background: var(--bg-header);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--border-subtle);
		will-change: transform, opacity;
		transition:
			background var(--transition-slow),
			border-color var(--transition-slow);
	}

	:global(html.light) .header {
		background: var(--bg-header);
	}

	.inner {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 1.5rem;
		height: 100%;
		max-width: 1560px; /* Expanded for a wider, more agile logo position */
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-left: auto;
		flex-shrink: 0;
	}

	:global(.dev-mode-active) .actions {
		gap: 0.4rem;
		flex-shrink: 0;
	}

	.inner.dev-mode-active {
		gap: 1rem;
	}

	.inner.dev-mode-active .logo {
		margin-right: 0.5rem;
	}

	.inner.dev-mode-active .nav {
		gap: 0.1rem;
	}

	.inner.dev-mode-active .nav-link {
		padding: 0.4em 0.5rem;
		font-size: 0.85rem;
	}

	@media (max-width: 1350px) {
		.inner {
			gap: 0.5rem;
		}
		
		.actions {
			margin-left: 0.5rem;
		}
	}

	@media (max-width: 1200px) {
		.inner {
			gap: 1.25rem;
		}
		
		.nav {
			gap: 0;
		}
		
		.nav-link {
			padding: 0.4em 0.6em;
		}
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--text-primary);
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 1.15rem;
		letter-spacing: -0.02em;
		transition: opacity var(--transition-fast);
	}

	.logo:hover {
		opacity: 0.8;
		color: var(--text-primary);
	}

	.logo-mark {
		font-size: 1.4rem;
		color: var(--text-primary);
		line-height: 1;
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.nav-link {
		position: relative;
		padding: 0.4em 0.85em;
		border-radius: var(--radius-sm);
		font-family: var(--font-sans);
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		text-align: center;
		transition:
			color var(--transition-fast),
			background var(--transition-fast);
	}

	.nav-link::after {
		content: '';
		position: absolute;
		bottom: 2px;
		left: 50%;
		transform: translateX(-50%) scaleX(0);
		width: 16px;
		height: 2px;
		background: var(--gradient-accent);
		border-radius: 2px;
		transition: transform var(--transition-base);
	}

	.nav-link:hover {
		color: var(--text-primary);
		background: rgba(116, 215, 237, 0.08);
	}

	:global(html.light) .nav-link:hover {
		background: rgba(116, 215, 237, 0.18);
	}

	.nav-link.active {
		color: var(--text-primary);
	}

	.nav-link.active::after {
		transform: translateX(-50%) scaleX(1);
	}

	.nav-dropdown {
		position: relative;
	}

	.dropdown-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.chevron {
		font-size: 0.8rem;
		transition: transform var(--transition-base);
	}

	.nav-dropdown.open .chevron {
		transform: rotate(180deg);
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 0.4rem);
		left: 0;
		min-width: 220px;
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--bg-secondary);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
		opacity: 0;
		visibility: hidden;
		transform: translateY(-6px);
		transition: all var(--transition-base);
		z-index: 120;
	}

	.nav-dropdown.open .dropdown-menu,
	.nav-dropdown:hover .dropdown-menu,
	.nav-dropdown:focus-within .dropdown-menu {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
	}

	.dropdown-link {
		display: block;
		padding: 0.6rem 0.75rem;
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		text-decoration: none;
		transition:
			background var(--transition-fast),
			color var(--transition-fast);
	}

	.dropdown-link:hover,
	.dropdown-link.active,
	.dropdown-link[aria-current='page'] {
		color: var(--text-primary);
		background: rgba(116, 215, 237, 0.1);
	}

	:global(html.light) .dropdown-link:hover,
	:global(html.light) .dropdown-link.active,
	:global(html.light) .dropdown-link[aria-current='page'] {
		background: rgba(116, 215, 237, 0.22);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.header-search-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.viewport-toggle {
		display: flex;
		align-items: center;
		background: var(--bg-hover);
		border-radius: var(--radius-md);
		border: 1px solid var(--border-subtle);
		padding: 0.15rem;
		gap: 0.1rem;
	}
	
	.view-btn {
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		color: var(--text-muted);
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	
	.view-btn:hover {
		color: var(--text-secondary);
	}
	
	.view-btn.active {
		background: var(--bg-card);
		color: var(--text-primary);
		box-shadow: 0 2px 4px rgba(0,0,0,0.06);
	}

	.header-search-wrap .search-icon {
		position: absolute;
		left: 0.75rem;
		color: var(--text-muted);
		pointer-events: none;
	}

	.header-search-input {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-pill);
		padding: 0.45rem 3rem 0.45rem 2.2rem;
		font-size: 0.85rem;
		color: var(--text-primary);
		width: 200px;
		transition: all var(--transition-base);
		outline: none;
	}

	.header-search-input:focus {
		width: 280px;
		border-color: var(--text-primary);
		box-shadow: var(--glow-cyan);
	}

	.dev-badge {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		font-size: 0.6rem;
		font-family: var(--font-mono);
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--bg);
		background: var(--text-primary);
		padding: 0.2em 0.5em;
		border-radius: var(--radius-pill);
		pointer-events: none;
	}

	.search-cmd {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		font-family: var(--font-sans);
		font-size: 0.65rem;
		color: var(--text-muted);
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		padding: 0.15em 0.4em;
		border-radius: 4px;
		pointer-events: none;
		opacity: 0.8;
		z-index: 10;
	}

	.action-btn {
		width: 38px;
		height: 38px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.mobile-search-btn {
		display: none !important;
	}

	.action-btn:hover {
		border-color: var(--text-primary);
		color: var(--text-primary);
		background: var(--bg-card-hover);
	}

	.action-btn.active {
		background: var(--accent-cyan-dim);
		border-color: var(--text-primary);
		color: var(--text-primary);
	}

	.cursor-toggle-wrapper {
		position: relative;
	}

	@media (max-width: 1024px) {
		.cursor-toggle-wrapper {
			display: none;
		}
	}

	.cursor-onboarding {
		position: absolute;
		top: calc(100% + 12px);
		right: -10px;
		width: 190px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.75rem 1rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
		z-index: 1000;
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		animation: float 3s ease-in-out infinite;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-4px); }
	}

	:global(html.dark) .cursor-onboarding {
		border-color: var(--text-primary);
		box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4), var(--glow-cyan);
	}

	.cursor-onboarding p {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		line-height: 1.3;
	}

	.dismiss-btn {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0 2px;
		font-size: 0.8rem;
		transition: color var(--transition-fast);
	}

	.dismiss-btn:hover {
		color: var(--text-primary);
	}

	.cursor-onboarding .arrow {
		position: absolute;
		top: -6px;
		right: 20px;
		width: 10px;
		height: 10px;
		background: var(--bg-card);
		border-left: 1px solid var(--text-primary);
		border-top: 1px solid var(--text-primary);
		transform: rotate(45deg);
	}

	.menu-btn {
		display: none;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 5px;
		width: 38px;
		height: 38px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		cursor: pointer;
		padding: 0;
	}

	.bar {
		display: block;
		width: 18px;
		height: 2px;
		background: var(--text-primary);
		border-radius: 2px;
		transition:
			transform var(--transition-base),
			opacity var(--transition-base);
	}

	.bar.open:nth-child(1) {
		transform: translateY(7px) rotate(45deg);
	}
	.bar.open:nth-child(2) {
		opacity: 0;
	}
	.bar.open:nth-child(3) {
		transform: translateY(-7px) rotate(-45deg);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 99;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
	}

	@media (max-width: 1024px) {
		.menu-btn {
			display: flex;
		}

		.cursor-toggle {
			display: none;
		}

		.header-search-input {
			width: 320px;
		}

		.nav {
			position: fixed;
			top: var(--header-height);
			left: 0;
			z-index: 100;
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
			width: 220px;
			padding: 1rem;
			background: var(--bg-secondary);
			border-right: 1px solid var(--border);
			border-bottom: 1px solid var(--border);
			border-radius: 0 0 var(--radius-lg) 0;
			transform: translateX(-100%);
			transition: transform var(--transition-base);
		}

		.nav.open {
			transform: translateX(0);
		}

		.nav-link {
			width: 100%;
			padding: 0.6em 0.75em;
		}

		.nav-dropdown {
			width: 100%;
		}

		.dropdown-toggle {
			width: 100%;
			justify-content: center;
			gap: 0.35rem;
			padding: 0.6em 0.75em;
		}

		.dropdown-menu {
			position: static;
			min-width: 0;
			width: 100%;
			margin-top: 0.25rem;
			padding: 0.35rem 0 0 0.75rem;
			border: none;
			box-shadow: none;
			background: transparent;
			transform: none;
			/* hide by default */
			display: none;
		}

		.nav-dropdown.open .dropdown-menu {
			display: block;
			opacity: 1;
			visibility: visible;
		}

		.dropdown-link {
			width: 100%;
			font-size: 0.8rem;
			padding: 0.45rem 0.75rem;
			text-align: center;
		}
	}

	@media (max-width: 640px) {
		.header-search-wrap {
			display: none;
		}

		.mobile-search-btn {
			display: flex !important;
		}
	}
</style>
