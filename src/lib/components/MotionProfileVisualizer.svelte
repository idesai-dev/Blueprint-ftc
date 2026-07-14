<script lang="ts">
	import { onMount } from 'svelte';

	// Profile parameters
	let maxVel = $state(80); // units/s
	let maxAccel = $state(40); // units/s²
	let distance = $state(200); // units

	// Playback
	let isRunning = $state(false);
	let simTime = $state(0); // seconds elapsed
	let position = $state(0);
	let velocity = $state(0);
	let accel = $state(0);

	const DT = 0.02; // 20ms timestep
	const GRAPH_W = 560;
	const GRAPH_H = 160;
	const PAD = 36;

	// ── Trapezoid profile math ──────────────────────────────────────────────
	type Profile = {
		accelTime: number;
		cruiseTime: number;
		decelTime: number;
		totalTime: number;
		peakVel: number;
		accelDist: number;
		cruiseDist: number;
	};

	function buildProfile(dist: number, vMax: number, aMax: number): Profile {
		const accelTime = vMax / aMax;
		const accelDist = 0.5 * aMax * accelTime * accelTime;

		let peakVel: number;
		let accelT: number;
		let cruiseDist: number;
		let cruiseTime: number;

		if (2 * accelDist > dist) {
			// Triangular (can't reach vMax)
			peakVel = Math.sqrt(aMax * dist);
			accelT = peakVel / aMax;
			cruiseDist = 0;
			cruiseTime = 0;
		} else {
			peakVel = vMax;
			accelT = accelTime;
			cruiseDist = dist - 2 * accelDist;
			cruiseTime = cruiseDist / vMax;
		}

		return {
			accelTime: accelT,
			cruiseTime,
			decelTime: accelT,
			totalTime: 2 * accelT + cruiseTime,
			peakVel,
			accelDist: 0.5 * aMax * accelT * accelT,
			cruiseDist
		};
	}

	function sampleProfile(t: number, p: Profile, aMax: number) {
		const { accelTime, cruiseTime, decelTime, totalTime, peakVel, accelDist, cruiseDist } = p;
		if (t <= 0) return { pos: 0, vel: 0, acc: 0 };
		if (t >= totalTime) return { pos: accelDist + cruiseDist + accelDist, vel: 0, acc: 0 };

		if (t < accelTime) {
			return { pos: 0.5 * aMax * t * t, vel: aMax * t, acc: aMax };
		} else if (t < accelTime + cruiseTime) {
			const dt = t - accelTime;
			return { pos: accelDist + peakVel * dt, vel: peakVel, acc: 0 };
		} else {
			const dt = t - accelTime - cruiseTime;
			const pos = accelDist + cruiseDist + peakVel * dt - 0.5 * aMax * dt * dt;
			return { pos, vel: peakVel - aMax * dt, acc: -aMax };
		}
	}

	// ── Reactive profile ───────────────────────────────────────────────────
	let profile = $derived(buildProfile(distance, maxVel, maxAccel));

	// ── Pre-bake graph curves ───────────────────────────────────────────────
	function buildCurve(
		profile: Profile,
		accessor: (s: ReturnType<typeof sampleProfile>) => number,
		yMax: number,
		yMin = 0
	): string {
		const steps = 200;
		const pts: string[] = [];
		for (let i = 0; i <= steps; i++) {
			const t = (i / steps) * profile.totalTime;
			const s = sampleProfile(t, profile, maxAccel);
			const x = PAD + (t / profile.totalTime) * (GRAPH_W - 2 * PAD);
			const range = yMax - yMin;
			const y = GRAPH_H - PAD - ((accessor(s) - yMin) / range) * (GRAPH_H - 2 * PAD);
			pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
		}
		return pts.join(' ');
	}

	let velCurve = $derived(buildCurve(profile, (s) => s.vel, maxVel));
	let accelCurve = $derived(buildCurve(profile, (s) => s.acc, maxAccel, -maxAccel));
	let posCurve = $derived(buildCurve(profile, (s) => s.pos, distance));

	// ── Playback dot position ───────────────────────────────────────────────
	let dotX = $derived(() => {
		if (profile.totalTime === 0) return PAD;
		return PAD + Math.min(simTime / profile.totalTime, 1) * (GRAPH_W - 2 * PAD);
	});

	let velDotY = $derived(() => {
		const s = sampleProfile(simTime, profile, maxAccel);
		return GRAPH_H - PAD - (s.vel / maxVel) * (GRAPH_H - 2 * PAD);
	});

	let posDotY = $derived(() => {
		const s = sampleProfile(simTime, profile, maxAccel);
		return GRAPH_H - PAD - (s.pos / distance) * (GRAPH_H - 2 * PAD);
	});

	let accelDotY = $derived(() => {
		const s = sampleProfile(simTime, profile, maxAccel);
		const range = 2 * maxAccel;
		return GRAPH_H - PAD - ((s.acc + maxAccel) / range) * (GRAPH_H - 2 * PAD);
	});

	// ── Simulation loop ────────────────────────────────────────────────────
	let intervalId: ReturnType<typeof setInterval> | null = null;

	function startSim() {
		if (intervalId) return;
		isRunning = true;
		intervalId = setInterval(() => {
			simTime += DT;
			const s = sampleProfile(simTime, profile, maxAccel);
			position = s.pos;
			velocity = s.vel;
			accel = s.acc;
			if (simTime >= profile.totalTime + 0.1) {
				stopSim();
			}
		}, DT * 1000);
	}

	function stopSim() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		isRunning = false;
	}

	function resetSim() {
		stopSim();
		simTime = 0;
		position = 0;
		velocity = 0;
		accel = 0;
	}

	onMount(() => () => stopSim());

	// ── Robot bar animation ─────────────────────────────────────────────────
	let robotPct = $derived(Math.min(position / distance, 1) * 100);
</script>

<div class="page">
	<header class="page-header">
		<div class="title-block">
			<span class="label">SIMULATION</span>
			<h1>Motion Profiling</h1>
			<p class="subtitle">
				Trapezoidal velocity profiles for smooth, controlled movement: the foundation of FTC
				autonomous routines.
			</p>
		</div>
		<div class="stat-row">
			<div class="stat">
				<span class="stat-label">Total Time</span>
				<span class="stat-value">{profile.totalTime.toFixed(2)}<em>s</em></span>
			</div>
			<div class="stat">
				<span class="stat-label">Peak Vel</span>
				<span class="stat-value">{profile.peakVel.toFixed(1)}<em>u/s</em></span>
			</div>
			<div class="stat">
				<span class="stat-label">Profile</span>
				<span class="stat-value">{profile.cruiseTime > 0 ? 'Trap' : 'Tri'}</span>
			</div>
		</div>
	</header>

	<!-- Robot Track -->
	<section class="card track-card">
		<div class="card-label">POSITION TRACK</div>
		<div class="track-container">
			<div class="track-bg">
				<div class="track-fill" style="width: {robotPct}%"></div>
				<div class="robot-dot" style="left: {robotPct}%">
					<div class="robot-glow"></div>
				</div>
			</div>
			<div class="track-labels">
				<span>0</span>
				<span>{distance} u</span>
			</div>
		</div>
		<div class="live-stats">
			<div class="live-stat">
				<span class="ls-label">pos</span>
				<span class="ls-value">{position.toFixed(1)}</span>
			</div>
			<div class="live-stat">
				<span class="ls-label">vel</span>
				<span class="ls-value accent-cyan">{velocity.toFixed(1)}</span>
			</div>
			<div class="live-stat">
				<span class="ls-label">acc</span>
				<span class="ls-value accent-yellow">{accel.toFixed(1)}</span>
			</div>
			<div class="live-stat">
				<span class="ls-label">t</span>
				<span class="ls-value accent-green">{simTime.toFixed(2)}s</span>
			</div>
		</div>
	</section>

	<!-- Graphs -->
	<section class="card graphs-card">
		<div class="card-label">VELOCITY PROFILE</div>
		<svg width={GRAPH_W} height={GRAPH_H} viewBox="0 0 {GRAPH_W} {GRAPH_H}" class="graph">
			<defs>
				<linearGradient id="vel-fill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="var(--accent-cyan)" stop-opacity="0.25" />
					<stop offset="100%" stop-color="var(--accent-cyan)" stop-opacity="0" />
				</linearGradient>
			</defs>
			<!-- Grid lines -->
			{#each [0, 0.25, 0.5, 0.75, 1] as frac}
				<line
					x1={PAD}
					y1={PAD + frac * (GRAPH_H - 2 * PAD)}
					x2={GRAPH_W - PAD}
					y2={PAD + frac * (GRAPH_H - 2 * PAD)}
					stroke="var(--border)"
					stroke-width="1"
					opacity="0.5"
					stroke-dasharray="3 4"
				/>
				<text
					x={PAD - 4}
					y={PAD + frac * (GRAPH_H - 2 * PAD) + 4}
					text-anchor="end"
					fill="var(--text-muted)"
					font-size="9"
					font-family="var(--font-mono)"
				>
					{((1 - frac) * maxVel).toFixed(0)}
				</text>
			{/each}
			<!-- Fill -->
			<path
				d="{velCurve} L {PAD + (GRAPH_W - 2 * PAD)} {GRAPH_H - PAD} L {PAD} {GRAPH_H - PAD} Z"
				fill="url(#vel-fill)"
			/>
			<!-- Curve -->
			<path
				d={velCurve}
				fill="none"
				stroke="var(--accent-cyan)"
				stroke-width="2.5"
				stroke-linejoin="round"
			/>
			<!-- Phase markers -->
			{#if profile.totalTime > 0}
				{@const x1 = PAD + (profile.accelTime / profile.totalTime) * (GRAPH_W - 2 * PAD)}
				{@const x2 =
					PAD +
					((profile.accelTime + profile.cruiseTime) / profile.totalTime) * (GRAPH_W - 2 * PAD)}
				<line
					{x1}
					y1={PAD}
					x2={x1}
					y2={GRAPH_H - PAD}
					stroke="var(--border)"
					stroke-dasharray="4 3"
					opacity="0.6"
				/>
				<line
					x1={x2}
					y1={PAD}
					{x2}
					y2={GRAPH_H - PAD}
					stroke="var(--border)"
					stroke-dasharray="4 3"
					opacity="0.6"
				/>
				<text
					x={PAD + 4}
					y={PAD + 10}
					fill="var(--text-muted)"
					font-size="8"
					font-family="var(--font-mono)">ACCEL</text
				>
				{#if profile.cruiseTime > 0.05}
					<text
						x={(x1 + x2) / 2}
						y={PAD + 10}
						text-anchor="middle"
						fill="var(--text-muted)"
						font-size="8"
						font-family="var(--font-mono)">CRUISE</text
					>
				{/if}
				<text
					x={GRAPH_W - PAD - 4}
					y={PAD + 10}
					text-anchor="end"
					fill="var(--text-muted)"
					font-size="8"
					font-family="var(--font-mono)">DECEL</text
				>
			{/if}
			<!-- Playback dot -->
			{#if simTime > 0 && simTime <= profile.totalTime}
				<line
					x1={dotX()}
					y1={PAD}
					x2={dotX()}
					y2={GRAPH_H - PAD}
					stroke="var(--accent-cyan)"
					stroke-width="1"
					opacity="0.5"
				/>
				<circle
					cx={dotX()}
					cy={velDotY()}
					r="5"
					fill="var(--accent-cyan)"
					style="filter: drop-shadow(0 0 5px var(--accent-cyan))"
				/>
			{/if}
			<!-- Axes -->
			<line
				x1={PAD}
				y1={GRAPH_H - PAD}
				x2={GRAPH_W - PAD}
				y2={GRAPH_H - PAD}
				stroke="var(--border)"
				stroke-width="1"
			/>
			<line x1={PAD} y1={PAD} x2={PAD} y2={GRAPH_H - PAD} stroke="var(--border)" stroke-width="1" />
		</svg>
	</section>

	<div class="graphs-row">
		<section class="card graph-half">
			<div class="card-label">POSITION</div>
			<svg width={GRAPH_W} height={GRAPH_H} viewBox="0 0 {GRAPH_W} {GRAPH_H}" class="graph">
				<defs>
					<linearGradient id="pos-fill" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="var(--accent-green)" stop-opacity="0.2" />
						<stop offset="100%" stop-color="var(--accent-green)" stop-opacity="0" />
					</linearGradient>
				</defs>
				{#each [0, 0.5, 1] as frac}
					<line
						x1={PAD}
						y1={PAD + frac * (GRAPH_H - 2 * PAD)}
						x2={GRAPH_W - PAD}
						y2={PAD + frac * (GRAPH_H - 2 * PAD)}
						stroke="var(--border)"
						stroke-width="1"
						opacity="0.4"
						stroke-dasharray="3 4"
					/>
					<text
						x={PAD - 4}
						y={PAD + frac * (GRAPH_H - 2 * PAD) + 4}
						text-anchor="end"
						fill="var(--text-muted)"
						font-size="9"
						font-family="var(--font-mono)"
					>
						{((1 - frac) * distance).toFixed(0)}
					</text>
				{/each}
				<path
					d="{posCurve} L {GRAPH_W - PAD} {GRAPH_H - PAD} L {PAD} {GRAPH_H - PAD} Z"
					fill="url(#pos-fill)"
				/>
				<path
					d={posCurve}
					fill="none"
					stroke="var(--accent-green)"
					stroke-width="2.5"
					stroke-linejoin="round"
				/>
				{#if simTime > 0 && simTime <= profile.totalTime}
					<circle
						cx={dotX()}
						cy={posDotY()}
						r="5"
						fill="var(--accent-green)"
						style="filter: drop-shadow(0 0 5px var(--accent-green))"
					/>
				{/if}
				<line
					x1={PAD}
					y1={GRAPH_H - PAD}
					x2={GRAPH_W - PAD}
					y2={GRAPH_H - PAD}
					stroke="var(--border)"
					stroke-width="1"
				/>
				<line
					x1={PAD}
					y1={PAD}
					x2={PAD}
					y2={GRAPH_H - PAD}
					stroke="var(--border)"
					stroke-width="1"
				/>
			</svg>
		</section>

		<section class="card graph-half">
			<div class="card-label">ACCELERATION</div>
			<svg width={GRAPH_W} height={GRAPH_H} viewBox="0 0 {GRAPH_W} {GRAPH_H}" class="graph">
				{#each [-1, 0, 1] as frac}
					{@const y = PAD + (1 - (frac + 1) / 2) * (GRAPH_H - 2 * PAD)}
					<line
						x1={PAD}
						y1={y}
						x2={GRAPH_W - PAD}
						y2={y}
						stroke={frac === 0 ? 'var(--border)' : 'var(--border)'}
						stroke-width={frac === 0 ? 1.5 : 1}
						opacity="0.5"
						stroke-dasharray={frac === 0 ? '' : '3 4'}
					/>
					<text
						x={PAD - 4}
						y={y + 4}
						text-anchor="end"
						fill="var(--text-muted)"
						font-size="9"
						font-family="var(--font-mono)"
					>
						{(frac * maxAccel).toFixed(0)}
					</text>
				{/each}
				<path
					d={accelCurve}
					fill="none"
					stroke="var(--accent-yellow)"
					stroke-width="2.5"
					stroke-linejoin="round"
				/>
				{#if simTime > 0 && simTime <= profile.totalTime}
					<circle
						cx={dotX()}
						cy={accelDotY()}
						r="5"
						fill="var(--accent-yellow)"
						style="filter: drop-shadow(0 0 5px var(--accent-yellow))"
					/>
				{/if}
				<line
					x1={PAD}
					y1={GRAPH_H - PAD}
					x2={GRAPH_W - PAD}
					y2={GRAPH_H - PAD}
					stroke="var(--border)"
					stroke-width="1"
				/>
				<line
					x1={PAD}
					y1={PAD}
					x2={PAD}
					y2={GRAPH_H - PAD}
					stroke="var(--border)"
					stroke-width="1"
				/>
			</svg>
		</section>
	</div>

	<!-- Controls -->
	<section class="card controls-card">
		<div class="card-label">PARAMETERS</div>
		<div class="controls-grid">
			<div class="control-group">
				<label for="dist-range">Distance <span>{distance} u</span></label>
				<input
					id="dist-range"
					type="range"
					min="20"
					max="500"
					step="5"
					bind:value={distance}
					oninput={resetSim}
				/>
			</div>
			<div class="control-group">
				<label for="vel-range">Max Velocity <span>{maxVel} u/s</span></label>
				<input
					id="vel-range"
					type="range"
					min="5"
					max="200"
					step="5"
					bind:value={maxVel}
					oninput={resetSim}
				/>
			</div>
			<div class="control-group">
				<label for="accel-range">Max Accel <span>{maxAccel} u/s²</span></label>
				<input
					id="accel-range"
					type="range"
					min="5"
					max="150"
					step="5"
					bind:value={maxAccel}
					oninput={resetSim}
				/>
			</div>
		</div>
		<div class="btn-row">
			{#if !isRunning}
				<button class="btn btn-primary" onclick={simTime > 0 ? resetSim : startSim}>
					{simTime > 0 ? 'Reset' : 'Run Profile'}
				</button>
				{#if simTime > 0}
					<button class="btn btn-secondary" onclick={startSim}>Run Again</button>
				{/if}
			{:else}
				<button class="btn btn-danger" onclick={stopSim}>Pause</button>
			{/if}
		</div>
	</section>

	<!-- Explainer -->
	<section class="card explainer-card">
		<div class="card-label">HOW IT WORKS</div>
		<div class="explainer-grid">
			<div class="explainer-item">
				<span class="phase-dot cyan"></span>
				<div>
					<strong>Acceleration Phase</strong>
					<p>
						Motor ramps up at max acceleration until reaching peak velocity. Duration = v_max /
						a_max.
					</p>
				</div>
			</div>
			<div class="explainer-item">
				<span class="phase-dot green"></span>
				<div>
					<strong>Cruise Phase</strong>
					<p>
						Constant velocity. Only present if distance is large enough, short moves produce a
						triangular profile.
					</p>
				</div>
			</div>
			<div class="explainer-item">
				<span class="phase-dot yellow"></span>
				<div>
					<strong>Deceleration Phase</strong>
					<p>
						Mirror of acceleration: motor decelerates at the same rate to arrive at the target with
						zero velocity.
					</p>
				</div>
			</div>
			<div class="explainer-item">
				<span class="phase-dot red"></span>
				<div>
					<strong>Triangular Profile</strong>
					<p>
						When distance is too short to reach max velocity, the profile becomes a triangle. Peak
						vel = √(a_max × dist).
					</p>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.page {
		max-width: 680px;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	/* Header */
	.page-header {
		margin-bottom: 0.5rem;
	}

	.label {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.15em;
		color: var(--accent-cyan);
		opacity: 0.8;
	}

	h1 {
		margin: 0.25rem 0 0.5rem;
		font-size: 2rem;
		color: var(--text-primary);
		line-height: 1.1;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.5;
		margin: 0 0 1.25rem;
		max-width: 520px;
	}

	.stat-row {
		display: flex;
		gap: 1.5rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.stat-label {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-muted);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.stat-value {
		font-family: var(--font-mono);
		font-size: 1.4rem;
		color: var(--text-primary);
		font-weight: 600;
	}

	.stat-value em {
		font-style: normal;
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-left: 2px;
	}

	/* Cards */
	.card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
	}

	.card-label {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.12em;
		color: var(--text-muted);
		margin-bottom: 1rem;
	}

	/* Track */
	.track-container {
		margin-bottom: 1rem;
	}

	.track-bg {
		position: relative;
		height: 12px;
		background: var(--bg-secondary);
		border-radius: 6px;
		overflow: visible;
		margin-bottom: 0.35rem;
	}

	.track-fill {
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--accent-cyan) 0%,
			color-mix(in srgb, var(--accent-cyan) 60%, var(--accent-green)) 100%
		);
		border-radius: 6px;
		transition: width 0.02s linear;
	}

	.robot-dot {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 20px;
		height: 20px;
		transition: left 0.02s linear;
	}

	.robot-glow {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: var(--accent-cyan);
		box-shadow:
			0 0 8px var(--accent-cyan),
			0 0 16px var(--accent-cyan);
	}

	.track-labels {
		display: flex;
		justify-content: space-between;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.live-stats {
		display: flex;
		gap: 1.5rem;
	}

	.live-stat {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.ls-label {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.ls-value {
		font-family: var(--font-mono);
		font-size: 1.1rem;
		color: var(--text-primary);
		font-weight: 600;
	}

	.ls-value.accent-cyan {
		color: var(--accent-cyan);
	}
	.ls-value.accent-yellow {
		color: var(--accent-yellow);
	}
	.ls-value.accent-green {
		color: var(--accent-green);
	}

	/* Graphs */
	.graph {
		width: 100%;
		height: auto;
		display: block;
	}

	.graphs-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
	}

	.graph-half .graph {
		width: 100%;
	}

	/* Controls */
	.controls-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1.25rem;
		margin-bottom: 1.25rem;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.control-group label {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text-secondary);
		display: flex;
		justify-content: space-between;
	}

	.control-group label span {
		color: var(--text-primary);
		font-weight: 600;
	}

	input[type='range'] {
		width: 100%;
		accent-color: var(--accent-cyan);
		cursor: pointer;
	}

	.btn-row {
		display: flex;
		gap: 0.75rem;
	}

	.btn {
		padding: 0.5rem 1.25rem;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.85rem;
		cursor: pointer;
		border: 1px solid transparent;
		transition: all 0.15s;
	}

	.btn-primary {
		background: var(--accent-cyan);
		color: var(--bg-primary, #0d1117);
		border-color: var(--accent-cyan);
	}

	.btn-primary:hover {
		filter: brightness(1.15);
	}

	.btn-secondary {
		background: var(--bg-secondary);
		color: var(--text-secondary);
		border-color: var(--border);
	}

	.btn-secondary:hover {
		color: var(--text-primary);
		background: var(--bg-card-hover);
	}

	.btn-danger {
		background: transparent;
		color: var(--accent-red, #f87171);
		border-color: var(--accent-red, #f87171);
	}

	.btn-danger:hover {
		background: rgba(248, 113, 113, 0.1);
	}

	/* Explainer */
	.explainer-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.explainer-item {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
	}

	.phase-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		margin-top: 4px;
		flex-shrink: 0;
	}

	.phase-dot.cyan {
		background: var(--accent-cyan);
		box-shadow: 0 0 6px var(--accent-cyan);
	}
	.phase-dot.green {
		background: var(--accent-green);
		box-shadow: 0 0 6px var(--accent-green);
	}
	.phase-dot.yellow {
		background: var(--accent-yellow);
		box-shadow: 0 0 6px var(--accent-yellow);
	}
	.phase-dot.red {
		background: var(--accent-red, #f87171);
	}

	.explainer-item strong {
		display: block;
		font-size: 0.85rem;
		color: var(--text-primary);
		margin-bottom: 0.2rem;
	}

	.explainer-item p {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	@media (max-width: 520px) {
		.graphs-row {
			grid-template-columns: 1fr;
		}
		.explainer-grid {
			grid-template-columns: 1fr;
		}
		.stat-row {
			gap: 1rem;
		}
	}
</style>
