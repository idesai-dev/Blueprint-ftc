<script lang="ts">
	let iframeLoaded = $state(false);
</script>

<svelte:head>
	<title>Pedro Path Visualizer | Blueprint</title>
	<meta
		name="description"
		content="Visualize, plan, and export Pedro Pathing autonomous paths for your FTC robot."
	/>
</svelte:head>

<header class="post-header text-center">
	<div class="post-header-bg" aria-hidden="true"></div>
	<div class="container container--wide">
		<div class="animate-fade-up" style="margin-bottom: 1rem;">
			<span class="badge">External Tool</span>
		</div>
		<h1 class="post-title animate-fade-up" style="animation-delay:60ms; margin: 0 auto 1rem;">Pedro Path Visualizer</h1>
		<p class="subtitle animate-fade-up" style="animation-delay:120ms">
			Plan and visualize autonomous paths for the <strong>PedroPathing</strong> library directly in
			your browser. Draw waypoints, adjust curves, and export path code — all without leaving Blueprint.
		</p>
		<div class="title-rule animate-fade-up" style="animation-delay:180ms; margin: 1.5rem auto 0;" aria-hidden="true"></div>
	</div>
</header>

<section class="page">
	<div class="container container--wide">

		<div class="visualizer-wrap animate-fade-up" style="animation-delay: 100ms">
			<div class="iframe-shell">
				<div class="iframe-topbar">
					<span class="iframe-label">visualizer.pedropathing.com</span>
					<a
						href="https://visualizer.pedropathing.com"
						target="_blank"
						rel="noopener noreferrer"
						class="open-external"
					>
						Open in new tab ↗
					</a>
				</div>

				{#if !iframeLoaded}
					<div class="iframe-loading">
						<div class="loading-spinner"></div>
						<span>Loading visualizer…</span>
					</div>
				{/if}

				<iframe
					src="https://visualizer.pedropathing.com"
					title="Pedro Path Visualizer"
					class="pedro-iframe"
					class:loaded={iframeLoaded}
					allow="fullscreen"
					onload={() => (iframeLoaded = true)}
				></iframe>
			</div>
		</div>

		<div class="credit-card animate-fade-up" style="animation-delay: 150ms">
			<div class="credit-inner">
				<span class="credit-dot"></span>
				<div class="credit-text">
					<strong>Credit — PedroPathing Team</strong>
					<p>
						This visualizer is built and maintained by the
						<a href="https://pedropathing.com" target="_blank" rel="noopener noreferrer"
							>PedroPathing team</a
						>. Pedro Pathing is a reactive path following library for FTC robots with advanced curve
						and heading control. All credit for this tool goes to them — Blueprint is simply
						embedding it here for convenience.
					</p>
					<div class="credit-links">
						<a
							href="https://pedropathing.com"
							target="_blank"
							rel="noopener noreferrer"
							class="credit-link"
						>
							↗ PedroPathing Website
						</a>
						<a
							href="https://github.com/Pedro-Pathing"
							target="_blank"
							rel="noopener noreferrer"
							class="credit-link"
						>
							↗ GitHub
						</a>
						<a
							href="https://visualizer.pedropathing.com"
							target="_blank"
							rel="noopener noreferrer"
							class="credit-link"
						>
							↗ Visualizer (full screen)
						</a>
					</div>
				</div>
			</div>
		</div>

		<div class="content animate-fade-up" style="animation-delay: 200ms">
			<h2>What is Pedro Pathing?</h2>
			<div class="grid-2">
				<div class="card">
					<h3>Path Following</h3>
					<p>
						Pedro Pathing uses a reactive, centripetal force-based algorithm to follow curves
						smoothly. Unlike pure pursuit or Ramsete, it continuously corrects the robot's heading
						and position along the path — even when perturbed mid-run.
					</p>
				</div>
				<div class="card">
					<h3>Using the Visualizer</h3>
					<ul>
						<li><strong>Add waypoints</strong> by clicking on the field to define your path.</li>
						<li>
							<strong>Adjust tangents</strong> to control how the robot curves through each point.
						</li>
						<li>
							<strong>Export</strong> the generated Java code and paste it directly into your OpMode.
						</li>
					</ul>
				</div>
			</div>

			<div class="callout animate-fade-up" style="animation-delay: 300ms">
				<h3>Learn more about Pedro Pathing</h3>
				<p>
					Visit the official PedroPathing documentation to learn how to integrate the library into
					your FTC project and take full advantage of reactive path following.
				</p>
				<a
					href="https://pedropathing.com"
					target="_blank"
					rel="noopener noreferrer"
					class="btn-link"
				>
					PedroPathing Docs →
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.page {
		padding: 3rem 0 6rem;
	}

	.post-header {
		position: relative;
		padding: 4rem 0 3rem;
		border-bottom: 1px solid var(--border-subtle);
		background: var(--gradient-hero);
		overflow: hidden;
		text-align: center;
	}

	.post-header .container {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.post-header h1 {
		font-size: clamp(2.5rem, 8vw, 4rem);
		line-height: 1.1;
		max-width: 800px;
	}

	.title-rule {
		height: 2px;
		background: var(--gradient-accent);
		border-radius: 2px;
		width: 60px;
		opacity: 0.6;
	}

	.subtitle {
		font-size: 1.15rem;
		color: var(--text-secondary);
		max-width: 680px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.visualizer-wrap {
		margin-bottom: 2rem;
		margin-left: -4rem;
		margin-right: -4rem;
	}

	.iframe-shell {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
		position: relative;
		width: 100%;
		max-width: 100%;
	}

	.iframe-topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
	}

	.iframe-label {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--text-muted);
	}

	.open-external {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--accent-cyan);
		text-decoration: none;
		transition: opacity 0.15s;
	}

	.open-external:hover {
		opacity: 0.75;
	}

	.iframe-loading {
		position: absolute;
		inset: 52px 0 0 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		font-family: var(--font-mono);
		font-size: 0.82rem;
		color: var(--text-muted);
		background: var(--bg-secondary);
		z-index: 1;
	}

	.loading-spinner {
		width: 28px;
		height: 28px;
		border: 2px solid var(--border);
		border-top-color: var(--accent-cyan);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.pedro-iframe {
		display: block;
		width: 100%;
		height: min(90vh, 980px);
		min-height: 720px;
		border: none;
		opacity: 0;
		transition: opacity 0.3s;
		background: var(--bg-secondary);
	}

	.pedro-iframe.loaded {
		opacity: 1;
	}

	.credit-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem 1.5rem;
		margin-bottom: 3rem;
	}

	.credit-inner {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.credit-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent-cyan);
		flex-shrink: 0;
		margin-top: 6px;
		box-shadow: 0 0 6px var(--accent-cyan);
	}

	.credit-text strong {
		display: block;
		font-size: 0.9rem;
		color: var(--text-primary);
		margin-bottom: 0.4rem;
	}

	.credit-text p {
		font-size: 0.85rem;
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: 0.75rem;
	}

	.credit-text a {
		color: var(--accent-cyan);
		text-decoration: none;
	}

	.credit-text a:hover {
		text-decoration: underline;
	}

	.credit-links {
		display: flex;
		gap: 1.25rem;
		flex-wrap: wrap;
	}

	.credit-link {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--accent-cyan);
		text-decoration: none;
		transition: opacity 0.15s;
	}

	.credit-link:hover {
		opacity: 0.7;
	}

	.content h2 {
		margin-bottom: 2rem;
		text-align: center;
	}

	.grid-2 {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		padding: 2rem;
		border-radius: var(--radius-lg);
	}

	.card h3 {
		margin-bottom: 1rem;
		color: var(--accent-cyan);
	}

	.card p,
	.card li {
		color: var(--text-body);
		font-size: 0.95rem;
		line-height: 1.6;
	}

	.card ul {
		list-style: none;
		padding: 0;
	}
	.card li {
		margin-bottom: 0.75rem;
	}

	.callout {
		background: var(--gradient-hero);
		border: 1px solid var(--border-subtle);
		padding: 3rem 2rem;
		border-radius: var(--radius-xl);
		text-align: center;
		margin-top: 1rem;
	}

	.callout h3 {
		margin-bottom: 1rem;
	}

	.callout p {
		color: var(--text-secondary);
		margin-bottom: 2rem;
		max-width: 500px;
		margin-left: auto;
		margin-right: auto;
	}

	.badge {
		display: inline-block;
		padding: 0.3rem 0.8rem;
		background: rgba(116, 215, 237, 0.1);
		color: var(--accent-cyan);
		border-radius: var(--radius-pill);
		font-size: 0.75rem;
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.btn-link {
		display: inline-block;
		padding: 0.8rem 1.8rem;
		background: var(--gradient-accent);
		color: white;
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 600;
		transition: transform 0.2s;
	}

	.btn-link:hover {
		transform: translateY(-2px);
	}

	@media (max-width: 820px) {
		.visualizer-wrap {
			margin-left: -1.5rem;
			margin-right: -1.5rem;
		}

		.pedro-iframe {
			height: 78vh;
			min-height: 620px;
		}
	}

	@media (max-width: 520px) {
		.visualizer-wrap {
			margin-left: -1rem;
			margin-right: -1rem;
		}

		.iframe-topbar {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.4rem;
		}
	}
</style>