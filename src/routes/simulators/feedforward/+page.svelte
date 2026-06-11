<script lang="ts">
	import FeedforwardVisualizer from '$lib/components/FeedforwardVisualizer.svelte';
	import { fade, fly } from 'svelte/transition';
</script>

<svelte:head>
	<title>Feedforward Tuning | Blueprint</title>
	<meta
		name="description"
		content="An interactive tool for understanding and tuning feedforward control constants for FTC robots."
	/>
</svelte:head>

<header class="post-header text-center">
	<div class="post-header-bg" aria-hidden="true"></div>
	<div class="container container--narrow">
		<div class="animate-fade-up" style="margin-bottom: 1rem;">
			<span class="badge">Advanced Tools</span>
		</div>
		<h1 class="post-title animate-fade-up" style="animation-delay:60ms; margin: 0 auto 1rem;">Feedforward Tuning</h1>
		<p class="subtitle animate-fade-up" style="animation-delay:120ms">
			Feedforward control predicts the motor output needed before errors even occur — reducing the
			burden on PID feedback and dramatically improving tracking accuracy in FTC drivetrains and
			mechanisms.
		</p>
		<div class="title-rule animate-fade-up" style="animation-delay:180ms; margin: 1.5rem auto 0;" aria-hidden="true"></div>
	</div>
</header>

<section class="page">
	<div class="container container--narrow">

		<div class="visualizer-wrap animate-fade-up" style="animation-delay: 100ms">
			<FeedforwardVisualizer />
		</div>

		<div class="content animate-fade-up" style="animation-delay: 200ms">
			<h2>How it Works</h2>
			<div class="grid-2">
				<div class="card">
					<h3>1. The Model</h3>
					<p>
						The simulator runs a motor plant with realistic back-EMF and static friction. Your
						feedforward constants predict the required voltage at each moment; feedback only
						corrects what's left over. Switch between <strong>FF Only</strong>,
						<strong>PID Only</strong>, and <strong>FF + PID</strong> to compare their tracking error directly.
					</p>
				</div>
				<div class="card">
					<h3>2. Tuning Guide</h3>
					<ul>
						<li>
							<strong>kS:</strong> Voltage to overcome static friction. Start small — if the motor hesitates
							at rest, increase it.
						</li>
						<li>
							<strong>kV:</strong> Voltage per unit/s of velocity. Tune this first — it's the dominant
							term during cruise.
						</li>
						<li>
							<strong>kA:</strong> Voltage per unit/s² of acceleration. Helps during ramp-up/down; usually
							small.
						</li>
					</ul>
				</div>
			</div>

			<div class="grid-2">
				<div class="card">
					<h3>3. The Equation</h3>
					<p>The feedforward output is calculated as:</p>
					<p
						style="font-family: var(--font-mono); font-size: 0.9rem; margin-top: 0.75rem; color: var(--text-primary);"
					>
						V = kS·sgn(v) + kV·v + kA·a
					</p>
					<p style="margin-top: 0.75rem;">
						Each term handles a different physical characteristic of your motor and mechanism.
					</p>
				</div>
				<div class="card">
					<h3>4. FF vs PID</h3>
					<p>
						PID reacts to errors <em>after</em> they happen. Feedforward <em>anticipates</em> the required
						output. Used together, FF handles the steady-state load while PID corrects small residual
						errors — giving you fast, stable, low-oscillation control.
					</p>
				</div>
			</div>

			<div class="callout animate-fade-up" style="animation-delay: 300ms">
				<h3>Want to implement this in code?</h3>
				<p>
					Our feedforward guide covers the full theory and provides a Java implementation compatible
					with the FTC SDK and Road Runner.
				</p>
				<a href="/software/feed-forward" class="btn">View Feedforward Guide →</a>
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
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.visualizer-wrap {
		margin-bottom: 4rem;
	}

	.content h2 {
		margin-bottom: 2rem;
		text-align: center;
	}

	.grid-2 {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
		margin-top: 4rem;
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

	.btn {
		display: inline-block;
		padding: 0.8rem 1.8rem;
		background: var(--gradient-accent);
		color: white;
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 600;
		transition: transform 0.2s;
	}

	.btn:hover {
		transform: translateY(-2px);
	}
</style>
