<script lang="ts">
	import { onMount } from 'svelte';

	// ── Feedforward constants ───────────────────────────────────────────────
	let kS = $state(0.05); // Static friction (voltage to overcome friction)
	let kV = $state(0.02); // Velocity constant (voltage per unit/s)
	let kA = $state(0.003); // Acceleration constant (voltage per unit/s²)

	// PID feedback (for comparison mode)
	let kP = $state(0.4);
	let kD = $state(0.1);

	// Mode
	type Mode = 'ff-only' | 'pid-only' | 'ff+pid';
	let mode = $state<Mode>('ff+pid');

	// Setpoint profile
	let targetVel = $state(80);
	let targetAccel = $state(40);

	// Simulation state
	const DT = 0.02;
	let t = $state(0);
	let pos = $state(0);
	let vel = $state(0);
	let isRunning = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	// Plant model constants (hidden from user, represents a real motor)
	const PLANT_KV = 0.018;
	const PLANT_KA = 0.004;
	const PLANT_KS = 0.06;
	const PLANT_MASS = 1.0;

	// History
	const MAX_H = 250;
	let velHistory = $state<{ t: number; v: number }[]>([]);
	let targetHistory = $state<{ t: number; v: number }[]>([]);
	let voltageHistory = $state<{ t: number; v: number }[]>([]);
	let errorHistory = $state<{ t: number; v: number }[]>([]);

	// ── Profile generator (trapezoidal velocity) ────────────────────────────
	function targetVelAtTime(time: number): number {
		const rampTime = targetVel / targetAccel;
		const holdTime = 1.5;
		const totalCycle = 2 * rampTime + holdTime + 0.5;
		const tc = time % totalCycle;

		if (tc < rampTime) return targetAccel * tc;
		if (tc < rampTime + holdTime) return targetVel;
		if (tc < 2 * rampTime + holdTime) return targetVel - targetAccel * (tc - rampTime - holdTime);
		return 0;
	}

	function targetAccelAtTime(time: number): number {
		const rampTime = targetVel / targetAccel;
		const holdTime = 1.5;
		const totalCycle = 2 * rampTime + holdTime + 0.5;
		const tc = time % totalCycle;

		if (tc < rampTime) return targetAccel;
		if (tc < rampTime + holdTime) return 0;
		if (tc < 2 * rampTime + holdTime) return -targetAccel;
		return 0;
	}

	// ── Controller ──────────────────────────────────────────────────────────
	let lastError = 0;

	function computeVoltage(tNow: number, currentVel: number): number {
		const tv = targetVelAtTime(tNow);
		const ta = targetAccelAtTime(tNow);
		const error = tv - currentVel;

		let ff = 0;
		let fb = 0;

		if (mode === 'ff-only' || mode === 'ff+pid') {
			ff = kS * Math.sign(tv) + kV * tv + kA * ta;
		}

		if (mode === 'pid-only' || mode === 'ff+pid') {
			const deriv = (error - lastError) / DT;
			fb = kP * error + kD * deriv;
		}

		lastError = error;
		return Math.max(-12, Math.min(12, ff + fb));
	}

	// ── Plant physics ────────────────────────────────────────────────────────
	function stepPlant(voltage: number, currentVel: number): number {
		// Back-EMF based motor model
		const backEmf = PLANT_KV * currentVel;
		const netVoltage = voltage - backEmf - PLANT_KS * Math.sign(currentVel || 0.001);
		const accelOut = netVoltage / (PLANT_KA * (1 / DT + 1));
		return currentVel + accelOut * DT * 0.6; // 0.6 = rough gain matching
	}

	// ── Sim loop ─────────────────────────────────────────────────────────────
	function step() {
		t += DT;
		const voltage = computeVoltage(t, vel);
		vel = stepPlant(voltage, vel);
		pos += vel * DT;

		const tv = targetVelAtTime(t);

		velHistory = [...velHistory.slice(-MAX_H), { t, v: vel }];
		targetHistory = [...targetHistory.slice(-MAX_H), { t: t, v: tv }];
		voltageHistory = [...voltageHistory.slice(-MAX_H), { t, v: voltage }];
		errorHistory = [...errorHistory.slice(-MAX_H), { t, v: tv - vel }];
	}

	function startSim() {
		if (intervalId) return;
		isRunning = true;
		lastError = 0;
		intervalId = setInterval(step, DT * 1000);
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
		t = 0;
		pos = 0;
		vel = 0;
		lastError = 0;
		velHistory = [];
		targetHistory = [];
		voltageHistory = [];
		errorHistory = [];
	}

	onMount(() => () => stopSim());

	// ── Graph helpers ────────────────────────────────────────────────────────
	const GW = 560,
		GH = 150,
		GP = 36;

	function toPath(data: { t: number; v: number }[], yMin: number, yMax: number): string {
		if (data.length < 2) return '';
		const tMin = data[0].t;
		const tRange = data[data.length - 1].t - tMin || 1;
		return data
			.map((d, i) => {
				const x = GP + ((d.t - tMin) / tRange) * (GW - 2 * GP);
				const y = GH - GP - ((d.v - yMin) / (yMax - yMin)) * (GH - 2 * GP);
				return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
			})
			.join(' ');
	}

	let velPath = $derived(toPath(velHistory, 0, targetVel * 1.3));
	let targetPath = $derived(toPath(targetHistory, 0, targetVel * 1.3));
	let voltPath = $derived(toPath(voltageHistory, -13, 13));
	let errorPath = $derived(toPath(errorHistory, -targetVel * 0.4, targetVel * 0.4));

	// ── Live metrics ─────────────────────────────────────────────────────────
	let currentError = $derived(
		velHistory.length ? targetHistory.at(-1)!.v - velHistory.at(-1)!.v : 0
	);
	let currentVoltage = $derived(voltageHistory.at(-1)?.v ?? 0);
	let rmsError = $derived(() => {
		if (errorHistory.length < 5) return 0;
		const sq = errorHistory.slice(-50).reduce((s, d) => s + d.v * d.v, 0);
		return Math.sqrt(sq / Math.min(errorHistory.length, 50));
	});
</script>

<div class="page">
	<header class="page-header">
		<div class="title-block">
			<span class="label">SIMULATION</span>
			<h1>Feedforward Tuning</h1>
			<p class="subtitle">
				Model-based control that predicts the required output, reducing the burden on feedback and
				improving tracking accuracy.
			</p>
		</div>
		<div class="stat-row">
			<div class="stat">
				<span class="stat-label">Velocity Error</span>
				<span
					class="stat-value {Math.abs(currentError) < 3
						? 'good'
						: Math.abs(currentError) < 10
							? 'warn'
							: 'bad'}">{currentError.toFixed(1)}<em>u/s</em></span
				>
			</div>
			<div class="stat">
				<span class="stat-label">RMS Error</span>
				<span class="stat-value {rmsError() < 3 ? 'good' : rmsError() < 10 ? 'warn' : 'bad'}"
					>{rmsError().toFixed(1)}</span
				>
			</div>
			<div class="stat">
				<span class="stat-label">Voltage</span>
				<span class="stat-value">{currentVoltage.toFixed(2)}<em>V</em></span>
			</div>
		</div>
	</header>

	<!-- Mode selector -->
	<section class="card mode-card">
		<div class="card-label">CONTROLLER MODE</div>
		<div class="mode-grid">
			{#each ['ff-only', 'pid-only', 'ff+pid'] as Mode[] as m}
				<button
					class="mode-btn {mode === m ? 'active' : ''}"
					onclick={() => {
						mode = m;
						resetSim();
					}}
				>
					<span class="mode-name">
						{#if m === 'ff-only'}FF Only{:else if m === 'pid-only'}PID Only{:else}FF + PID{/if}
					</span>
					<span class="mode-desc">
						{#if m === 'ff-only'}Predictive, no correction{:else if m === 'pid-only'}Reactive, no
							model{:else}Best of both{/if}
					</span>
				</button>
			{/each}
		</div>
	</section>

	<!-- Velocity tracking graph -->
	<section class="card">
		<div class="card-label">VELOCITY TRACKING</div>
		<svg width={GW} height={GH} viewBox="0 0 {GW} {GH}" class="graph">
			<defs>
				<linearGradient id="ff-vel-fill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="var(--accent-cyan)" stop-opacity="0.2" />
					<stop offset="100%" stop-color="var(--accent-cyan)" stop-opacity="0" />
				</linearGradient>
			</defs>
			{#each [0, 0.5, 1] as frac}
				<line
					x1={GP}
					y1={GP + frac * (GH - 2 * GP)}
					x2={GW - GP}
					y2={GP + frac * (GH - 2 * GP)}
					stroke="var(--border)"
					stroke-width="1"
					opacity="0.4"
					stroke-dasharray="3 4"
				/>
				<text
					x={GP - 4}
					y={GP + frac * (GH - 2 * GP) + 4}
					text-anchor="end"
					fill="var(--text-muted)"
					font-size="9"
					font-family="var(--font-mono)"
				>
					{((1 - frac) * targetVel * 1.3).toFixed(0)}
				</text>
			{/each}

			<!-- Target -->
			<path
				d={targetPath}
				fill="none"
				stroke="var(--accent-green)"
				stroke-width="1.5"
				stroke-dasharray="5 3"
				opacity="0.7"
			/>
			<!-- Actual -->
			{#if velHistory.length > 1}
				<path
					d="{velPath} L {GP + (GW - 2 * GP)} {GH - GP} L {GP} {GH - GP} Z"
					fill="url(#ff-vel-fill)"
				/>
				<path
					d={velPath}
					fill="none"
					stroke="var(--accent-cyan)"
					stroke-width="2.5"
					stroke-linejoin="round"
				/>
			{/if}

			<!-- Legend -->
			<line
				x1={GW - GP - 80}
				y1={GP + 8}
				x2={GW - GP - 60}
				y2={GP + 8}
				stroke="var(--accent-green)"
				stroke-width="1.5"
				stroke-dasharray="5 3"
			/>
			<text
				x={GW - GP - 56}
				y={GP + 12}
				fill="var(--text-muted)"
				font-size="8"
				font-family="var(--font-mono)">TARGET</text
			>
			<line
				x1={GW - GP - 80}
				y1={GP + 22}
				x2={GW - GP - 60}
				y2={GP + 22}
				stroke="var(--accent-cyan)"
				stroke-width="2"
			/>
			<text
				x={GW - GP - 56}
				y={GP + 26}
				fill="var(--text-muted)"
				font-size="8"
				font-family="var(--font-mono)">ACTUAL</text
			>

			<line
				x1={GP}
				y1={GH - GP}
				x2={GW - GP}
				y2={GH - GP}
				stroke="var(--border)"
				stroke-width="1"
			/>
			<line x1={GP} y1={GP} x2={GP} y2={GH - GP} stroke="var(--border)" stroke-width="1" />
		</svg>
	</section>

	<div class="graphs-row">
		<section class="card graph-half">
			<div class="card-label">VOLTAGE OUTPUT</div>
			<svg width={GW} height={GH} viewBox="0 0 {GW} {GH}" class="graph">
				{#each [-1, 0, 1] as frac}
					<line
						x1={GP}
						y1={GP + (1 - (frac + 1) / 2) * (GH - 2 * GP)}
						x2={GW - GP}
						y2={GP + (1 - (frac + 1) / 2) * (GH - 2 * GP)}
						stroke="var(--border)"
						stroke-width={frac === 0 ? 1.5 : 1}
						opacity="0.5"
						stroke-dasharray={frac === 0 ? '' : '3 4'}
					/>
					<text
						x={GP - 4}
						y={GP + (1 - (frac + 1) / 2) * (GH - 2 * GP) + 4}
						text-anchor="end"
						fill="var(--text-muted)"
						font-size="9"
						font-family="var(--font-mono)">{frac * 12}V</text
					>
				{/each}
				<path
					d={voltPath}
					fill="none"
					stroke="var(--accent-yellow)"
					stroke-width="2"
					stroke-linejoin="round"
				/>
				<line
					x1={GP}
					y1={GH - GP}
					x2={GW - GP}
					y2={GH - GP}
					stroke="var(--border)"
					stroke-width="1"
				/>
				<line x1={GP} y1={GP} x2={GP} y2={GH - GP} stroke="var(--border)" stroke-width="1" />
			</svg>
		</section>

		<section class="card graph-half">
			<div class="card-label">VELOCITY ERROR</div>
			<svg width={GW} height={GH} viewBox="0 0 {GW} {GH}" class="graph">
				{#each [-1, 0, 1] as frac}
					<line
						x1={GP}
						y1={GP + (1 - (frac + 1) / 2) * (GH - 2 * GP)}
						x2={GW - GP}
						y2={GP + (1 - (frac + 1) / 2) * (GH - 2 * GP)}
						stroke="var(--border)"
						stroke-width={frac === 0 ? 1.5 : 1}
						opacity="0.5"
						stroke-dasharray={frac === 0 ? '' : '3 4'}
					/>
					<text
						x={GP - 4}
						y={GP + (1 - (frac + 1) / 2) * (GH - 2 * GP) + 4}
						text-anchor="end"
						fill="var(--text-muted)"
						font-size="9"
						font-family="var(--font-mono)">{(frac * targetVel * 0.4).toFixed(0)}</text
					>
				{/each}
				<path
					d={errorPath}
					fill="none"
					stroke="var(--accent-red, #f87171)"
					stroke-width="2"
					stroke-linejoin="round"
				/>
				<line
					x1={GP}
					y1={GH - GP}
					x2={GW - GP}
					y2={GH - GP}
					stroke="var(--border)"
					stroke-width="1"
				/>
				<line x1={GP} y1={GP} x2={GP} y2={GH - GP} stroke="var(--border)" stroke-width="1" />
			</svg>
		</section>
	</div>

	<!-- Controls -->
	<section class="card controls-card">
		<div class="controls-split">
			<div class="controls-group">
				<div class="card-label">FEEDFORWARD GAINS</div>
				<div class="sliders">
					<div class="control-group">
						<label for="ks-slider">kS - Static <span>{kS.toFixed(3)}</span></label>
						<input id="ks-slider" type="range" min="0" max="0.3" step="0.005" bind:value={kS} />
					</div>
					<div class="control-group">
						<label for="kv-slider">kV - Velocity <span>{kV.toFixed(3)}</span></label>
						<input id="kv-slider" type="range" min="0" max="0.08" step="0.001" bind:value={kV} />
					</div>
					<div class="control-group">
						<label for="ka-slider">kA - Accel <span>{kA.toFixed(4)}</span></label>
						<input id="ka-slider" type="range" min="0" max="0.02" step="0.0002" bind:value={kA} />
					</div>
				</div>
			</div>

			<div class="divider"></div>

			<div class="controls-group">
				<div class="card-label">FEEDBACK GAINS (PID)</div>
				<div class="sliders {mode === 'ff-only' ? 'disabled' : ''}">
					<div class="control-group">
						<label for="kp-slider">kP <span>{kP.toFixed(2)}</span></label>
						<input
							id="kp-slider"
							type="range"
							min="0"
							max="2"
							step="0.02"
							bind:value={kP}
							disabled={mode === 'ff-only'}
						/>
					</div>
					<div class="control-group">
						<label for="kd-slider">kD <span>{kD.toFixed(2)}</span></label>
						<input
							id="kd-slider"
							type="range"
							min="0"
							max="0.5"
							step="0.01"
							bind:value={kD}
							disabled={mode === 'ff-only'}
						/>
					</div>
				</div>
			</div>
		</div>

		<div class="controls-split profile-split">
			<div class="controls-group">
				<div class="card-label">SETPOINT PROFILE</div>
				<div class="sliders">
					<div class="control-group">
						<label for="tvel-slider">Target Vel <span>{targetVel} u/s</span></label>
						<input
							id="tvel-slider"
							type="range"
							min="10"
							max="150"
							step="5"
							bind:value={targetVel}
							oninput={resetSim}
						/>
					</div>
					<div class="control-group">
						<label for="tacc-slider">Ramp Accel <span>{targetAccel} u/s²</span></label>
						<input
							id="tacc-slider"
							type="range"
							min="5"
							max="100"
							step="5"
							bind:value={targetAccel}
							oninput={resetSim}
						/>
					</div>
				</div>
			</div>
		</div>

		<div class="btn-row">
			{#if !isRunning}
				<button class="btn btn-primary" onclick={startSim}>Run</button>
				<button class="btn btn-secondary" onclick={resetSim}>Reset</button>
			{:else}
				<button class="btn btn-danger" onclick={stopSim}>Pause</button>
				<button class="btn btn-secondary" onclick={resetSim}>Reset</button>
			{/if}
		</div>
	</section>

	<!-- Explainer -->
	<section class="card explainer-card">
		<div class="card-label">UNDERSTANDING FEEDFORWARD</div>
		<div class="ff-eq">
			<span class="eq-label">V =</span>
			<span class="eq-term ks">kS·sgn(v)</span>
			<span class="eq-plus">+</span>
			<span class="eq-term kv">kV·v</span>
			<span class="eq-plus">+</span>
			<span class="eq-term ka">kA·a</span>
		</div>
		<div class="explainer-grid">
			<div class="explainer-item">
				<span class="phase-dot ks-dot"></span>
				<div>
					<strong>kS - Static Friction</strong>
					<p>
						Minimum voltage to overcome static friction and start moving. Applied as ±kS based on
						direction of motion.
					</p>
				</div>
			</div>
			<div class="explainer-item">
				<span class="phase-dot kv-dot"></span>
				<div>
					<strong>kV - Velocity Gain</strong>
					<p>
						Voltage required to sustain a given velocity against back-EMF and friction. Dominant
						during cruise phase.
					</p>
				</div>
			</div>
			<div class="explainer-item">
				<span class="phase-dot ka-dot"></span>
				<div>
					<strong>kA - Acceleration Gain</strong>
					<p>
						Extra voltage needed to accelerate the mechanism's inertia. Matters most during
						ramp-up/ramp-down.
					</p>
				</div>
			</div>
			<div class="explainer-item">
				<span class="phase-dot fb-dot"></span>
				<div>
					<strong>Feedback Role</strong>
					<p>
						With good FF, feedback only corrects small residual errors - it doesn't have to do all
						the work, reducing oscillation.
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

	.stat-value.good {
		color: var(--accent-green);
	}
	.stat-value.warn {
		color: var(--accent-yellow);
	}
	.stat-value.bad {
		color: var(--accent-red, #f87171);
	}

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

	/* Mode selector */
	.mode-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 0.75rem;
	}

	.mode-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.85rem 0.5rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.15s;
		text-align: center;
	}

	.mode-btn:hover {
		border-color: var(--accent-cyan);
	}

	.mode-btn.active {
		border-color: var(--accent-cyan);
		background: color-mix(in srgb, var(--accent-cyan) 10%, var(--bg-secondary));
	}


	.mode-name {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text-primary);
		font-weight: 600;
	}

	.mode-desc {
		font-size: 0.7rem;
		color: var(--text-muted);
		line-height: 1.3;
	}

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

	/* Controls */
	.controls-split {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.profile-split {
		grid-template-columns: 1fr;
	}

	.divider {
		width: 1px;
		background: var(--border);
		align-self: stretch;
	}

	.sliders {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.sliders.disabled {
		opacity: 0.35;
		pointer-events: none;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.control-group label {
		font-family: var(--font-mono);
		font-size: 0.78rem;
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

	input[type='range']:disabled {
		cursor: not-allowed;
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
		background: var(--accent-green);
		color: #102a43;
		border-color: var(--accent-green);
		font-weight: 700;
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

	/* FF equation */
	.ff-eq {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
		font-family: var(--font-mono);
		font-size: 1.1rem;
		flex-wrap: wrap;
	}

	.eq-label {
		color: var(--text-secondary);
	}
	.eq-plus {
		color: var(--text-muted);
	}
	.eq-term {
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-weight: 700;
	}
	.ks {
		background: rgba(251, 191, 36, 0.15);
		color: var(--accent-yellow);
	}
	.kv {
		background: rgba(34, 211, 238, 0.15);
		color: var(--accent-cyan);
	}
	.ka {
		background: rgba(74, 222, 128, 0.15);
		color: var(--accent-green);
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

	.ks-dot {
		background: var(--accent-yellow);
		box-shadow: 0 0 5px var(--accent-yellow);
	}
	.kv-dot {
		background: var(--accent-cyan);
		box-shadow: 0 0 5px var(--accent-cyan);
	}
	.ka-dot {
		background: var(--accent-green);
		box-shadow: 0 0 5px var(--accent-green);
	}
	.fb-dot {
		background: var(--text-muted);
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
		.controls-split {
			grid-template-columns: 1fr;
		}
		.divider {
			display: none;
		}
		.mode-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
