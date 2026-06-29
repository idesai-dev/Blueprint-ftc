---
title: Pedro Pathing Introduction
panelCategory: "Pedro Pathing"
date: 2026-06-15
description: A powerful path-following library for FTC.
tags: [software, intermediate, autonomous, completed]
author: Ishaan Desai
published: true
---

<div style="padding: 0.9rem 1.4rem; background: rgba(114, 178, 204, 0.07); border-left: 4px solid var(--accent-cyan); border-radius: 6px; margin-bottom: 1.5rem; font-size: 0.93rem;">
For more detailed information, visit the <a href="https://github.com/Pedro-Pathing" target="_blank" rel="noopener">official Pedro Pathing GitHub</a>.
</div>

# Introduction to Pedro Pathing

Pedro Pathing is a path-following library for FTC robots. Instead of driving for a set number of encoder ticks and hoping the robot ends up where you expect, Pedro uses bezier curves and a follower controller to move the robot along a smooth, precise path - making corrections the whole way. If you have used Road Runner before, the idea is similar, but Pedro is built specifically for FTC and has some nice improvements to how it handles heading and lateral movement on mecanum drives.

The result is autonomous routines that are smoother, faster, and more repeatable than anything you can get from pure encoder-based driving.

## Installation

Pedro Pathing has an official quickstart project, similar to the Road Runner quickstart. Head to the Pedro Pathing GitHub at [https://github.com/Pedro-Pathing](https://github.com/Pedro-Pathing) and download the quickstart repository. Open it in Android Studio and you will have a working starting point with the library already included. The quickstart handles the Gradle dependency for you, but if you are adding Pedro to an existing project, check the official docs for the current dependency string - the version number changes with updates and it is easy to end up with a stale one.

## Three Concepts Worth Understanding

Before you jump into tuning, it helps to know what the three main pieces are.

The **Follower** is the core controller. It reads where the robot is, compares that to where it should be on the path, and drives the motors accordingly. Every autonomous op mode you write will use a Follower instance.

**Paths** are the routes you define using bezier curves. A bezier curve lets you describe not just where the robot starts and ends, but how it gets there - you can shape the curve with control points to go around obstacles or hit the correct angle at a specific field tile.

The **Localizer** is what tells the Follower where the robot actually is on the field in real time. Without accurate localization, the follower cannot make meaningful corrections. Pedro supports several localizer options covered in the localization guide.

## Hardware Requirements

Pedro Pathing requires a mecanum drivetrain. It is built around the four-wheel holonomic model and does not support tank or other drive configurations. You also need some form of odometry - at minimum a two-deadwheel plus IMU setup, though a Pinpoint Odometry Computer or three-wheel pod setup will give you better accuracy.

## What to Do Next

Once you have the quickstart installed and your hardware wired up, the next step is tuning. Check out the tuning guide to calibrate your follower constants, then move on to the making-an-auto guide to start writing your first autonomous routine.
