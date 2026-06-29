---
title: Pedro Pathing: How to Tune
panelCategory: "Pedro Pathing"
date: 2026-06-19
description: Step-by-step guide to tuning your robot for Pedro Pathing.
tags: [completed, software, intermediate]
author: Ishaan Desai
published: true
---

<div style="padding: 0.9rem 1.4rem; background: rgba(114, 178, 204, 0.07); border-left: 4px solid var(--accent-cyan); border-radius: 6px; margin-bottom: 1.5rem; font-size: 0.93rem;">
For more detailed information, visit the <a href="https://github.com/Pedro-Pathing" target="_blank" rel="noopener">official Pedro Pathing GitHub</a>.
</div>

# Tuning Your Robot for Pedro Pathing

Tuning is the most important thing you can do to get Pedro Pathing working well. Skip it or rush it, and your robot will drift, oscillate, or just refuse to follow paths accurately. Do it carefully, and your autonomous will be repeatable and precise. The good news is that Pedro Pathing comes with a set of built-in tuning OpModes that walk you through the process one step at a time.

## Before You Start

Connect your laptop to the Control Hub's Wi-Fi network, then open FTC Dashboard in your browser at `192.168.43.1:8080/dash`. You'll use this throughout the tuning process to watch live graphs and tweak constants without re-deploying code. Every tuning OpMode outputs data to the dashboard, so keep that tab open the whole time.

## Step 1: Lateral Localization Tuner

Run the lateral localization tuner OpMode. When it's running, push the robot forward by hand - exactly 48 inches (or whatever distance the OpMode specifies). The OpMode measures how many encoder ticks the forward odometry pod recorded over that distance and computes the correct conversion factor. This step calibrates the forward axis of your odometry, so measure your 48 inches carefully. Repeat it a few times if your numbers look inconsistent.

## Step 2: Strafe Localization Tuner

Same idea, but sideways. Push the robot sideways 48 inches while the strafe localization tuner is running. This calibrates the lateral odometry pod. If your robot uses a two-wheel odometry setup rather than three, double-check which axes your setup covers before running this step.

## Step 3: Forward Velocity Tuner

This one actually drives the robot. The OpMode runs the robot forward at full power for a set distance and records how fast it actually moved. Pedro uses this to know the real maximum forward velocity of your drivetrain, which feeds into the motion profile math. Let the OpMode run a few times and make sure the velocity reading settles to a consistent number.

## Step 4: Strafe Velocity Tuner

Same as above but strafing. Mecanum drives are typically slower strafing than driving forward, so this value will usually be lower. Pedro handles the two axes separately, which is why there are separate tuners for each.

## Step 5: Follower PID Tuner

This is where the real tuning happens. The OpMode makes the robot try to follow a simple path, and your job is to watch the dashboard graphs and adjust the PID constants until the robot tracks cleanly. The constants live in `FollowerConstants.java` (or the equivalent config file in your version of Pedro).

Start with a low P value and slowly increase it. If the robot is too sluggish to correct errors, raise P. If it starts oscillating or wobbling around the path, lower P and add some D. The general rule is: increase P to fix slow corrections, increase D to fix oscillations. Keep the I term near zero unless you're seeing persistent steady-state error.

Check the Pedro Pathing docs for the exact OpMode names since they may differ between library versions.

## Common Issues

If the robot doesn't drive straight during the velocity tuning steps, go back and re-run the localization tuners. A small calibration error in the odometry will compound into larger path errors later. If the robot follows the general shape of a path but is consistently offset, the localization calibration is the most likely culprit. If it follows accurately but oscillates, that's a PID issue - focus on the D term.
