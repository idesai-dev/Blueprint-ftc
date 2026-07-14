<script lang="ts">
	import { a11yState, setTextSize, toggleReduceMotion, toggleHighContrast, toggleUnderlineLinks } from '$lib/stores/a11y.svelte';

	let open = $state(false);
	let wrapper: HTMLDivElement | undefined = $state();

	function handleClickOutside(e: MouseEvent) {
		if (open && wrapper && !wrapper.contains(e.target as Node)) {
			open = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div class="a11y-wrapper" bind:this={wrapper}>
	<button
		class="action-btn a11y-trigger"
		class:active={open}
		onclick={() => (open = !open)}
		aria-label="Text size and accessibility"
		aria-expanded={open}
		title="Text size and accessibility"
	>
		<span class="a-glyph">A</span>
	</button>

	{#if open}
		<div class="a11y-panel" role="menu" aria-label="Accessibility settings">
			<div class="a11y-section">
				<span class="a11y-heading">Text Size</span>
				<div class="a11y-segmented" role="radiogroup" aria-label="Text size">
					<button role="radio" aria-checked={a11yState.textSize === 'default'} class:active={a11yState.textSize === 'default'} onclick={() => setTextSize('default')}>Default</button>
					<button role="radio" aria-checked={a11yState.textSize === 'large'} class:active={a11yState.textSize === 'large'} onclick={() => setTextSize('large')}>Large</button>
					<button role="radio" aria-checked={a11yState.textSize === 'xlarge'} class:active={a11yState.textSize === 'xlarge'} onclick={() => setTextSize('xlarge')}>X-Large</button>
				</div>
			</div>

			<div class="a11y-section">
				<label class="a11y-row">
					<span>High contrast text</span>
					<input type="checkbox" checked={a11yState.highContrast} onchange={toggleHighContrast} />
				</label>
				<label class="a11y-row">
					<span>Underline links</span>
					<input type="checkbox" checked={a11yState.underlineLinks} onchange={toggleUnderlineLinks} />
				</label>
				<label class="a11y-row">
					<span>Reduce motion</span>
					<input type="checkbox" checked={a11yState.reduceMotion} onchange={toggleReduceMotion} />
				</label>
			</div>
		</div>
	{/if}
</div>

<style>
	.a11y-wrapper {
		position: relative;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		border-radius: var(--radius-md);
		background: var(--bg-card);
		border: 1px solid var(--border);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.action-btn:hover,
	.action-btn.active {
		color: var(--text-primary);
		border-color: var(--text-primary);
		background: var(--bg-card-hover);
	}

	.a-glyph {
		font-family: var(--font-heading, sans-serif);
		font-weight: 700;
		font-size: 1.05rem;
		line-height: 1;
	}

	.a11y-panel {
		position: absolute;
		top: calc(100% + 0.6rem);
		right: 0;
		width: 260px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		z-index: 100;
	}

	.a11y-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.a11y-section + .a11y-section {
		padding-top: 0.85rem;
		border-top: 1px solid var(--border-subtle);
	}

	.a11y-heading {
		font-size: 0.72rem;
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
	}

	.a11y-segmented {
		display: flex;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.a11y-segmented button {
		flex: 1;
		padding: 0.45rem 0.4rem;
		background: transparent;
		border: none;
		border-left: 1px solid var(--border);
		font-size: 0.75rem;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.a11y-segmented button:first-child {
		border-left: none;
	}

	.a11y-segmented button.active {
		background: var(--text-primary);
		color: var(--bg);
	}

	.a11y-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		font-size: 0.85rem;
		color: var(--text-primary);
		cursor: pointer;
	}

	.a11y-row input[type='checkbox'] {
		width: 34px;
		height: 20px;
		accent-color: var(--accent-cyan);
		cursor: pointer;
	}
</style>
