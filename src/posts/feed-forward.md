---
title: Feedforward Control
panelCategory: "Control"
date: 2026-05-22
description: A practical guide to feedforward control for FTC mechanisms.
tags: [completed, software, intermediate, control, completed]
author: Ishaan Desai
published: true
---

<script>
    import FeedforwardVisualizer from '$lib/components/FeedforwardVisualizer.svelte';
</script>

Feedforward control is about being proactive instead of reactive. PID watches what your mechanism is doing wrong and corrects it after the fact. Feedforward looks at what you want the mechanism to do and pre-calculates the power needed to make it happen, before any error builds up.

<div class="tuner-callout">
    <p> <strong>Try our <a href="/simulators/feedforward">Feedforward + PID Simulator</a></strong> for a deeper understanding of Feedforward!</p>
</div>

<FeedforwardVisualizer />

## Why Use Feedforward?

Think about an arm or a linear slide. Gravity is constantly pulling it down. If you only use PID, the mechanism will sag below your target position until the error gets large enough for the integral term to compensate. That lag is annoying and it makes the robot feel slow and imprecise.

Feedforward solves this by directly accounting for the forces your mechanism has to fight. Instead of waiting for the arm to droop, you just add a constant amount of power to hold it up. The PID then handles the small corrections on top of that.

## The Three Feedforward Terms

There are three feedforward components you will encounter in FTC. You probably will not need all three for every mechanism, but it helps to know what each one does.

**Velocity Feedforward (K_v)** is the amount of power needed per unit of velocity. If you want your mechanism to move at a specific speed, multiply your target velocity by K_v to get close to the right power output.

- Output = K_v x target velocity

**Static Friction Feedforward (K_s)** is the minimum power needed to get your mechanism moving at all. Friction acts against motion, so you need a baseline "kick" to overcome it before any velocity feedforward takes effect.

- Output = K_s (applied in the direction of motion)

**Gravity Feedforward (K_g)** is the one most FTC teams actually need. For a linear slide, gravity pulls down with a constant force, so K_g is a constant power offset. For a rotating arm, the gravitational load changes with the arm's angle, so you multiply by the cosine of the angle.

- Linear slide: Output = K_g
- Rotating arm: Output = K_g x cos(angle)

## Implementation in FTC

Here is a feedforward class for a linear slide. It takes all four possible terms and calculates the total power output.

```java
public class SlideFeedforward {
    private double ks, kg, kv, ka;

    public SlideFeedforward(double ks, double kg, double kv, double ka) {
        this.ks = ks;
        this.kg = kg;
        this.kv = kv;
        this.ka = ka;
    }

    public double calculate(double velocity, double acceleration) {
        return (ks * Math.signum(velocity)) + kg + (kv * velocity) + (ka * acceleration);
    }
}
```

## Combining PID and Feedforward

In practice, you almost always run PID and feedforward together. Feedforward does the heavy lifting by getting the mechanism close to the right output. PID then handles the small remaining error.

```java
double ff_power = feedforward.calculate(target_vel, target_accel);
double pid_power = pid.calculate(current_position);

motor.setPower(ff_power + pid_power);
```

This combination is faster to respond than PID alone and does not need a large I gain to hold position against gravity.

## Tuning Feedforward

Start with K_s: slowly increase it until the mechanism just barely starts to move. That is your static friction threshold. Then work on K_v by running the mechanism at a constant speed and adjusting until the actual speed matches your target. Finally, tune K_g by finding the power needed to hold the mechanism still at your target position.

If your robot uses Road Runner or Pedro Pathing, those libraries have built-in tuning routines for the drivetrain's feedforward terms. For your custom mechanisms, you tune them manually as described above.
