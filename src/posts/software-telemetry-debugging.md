---
title: Telemetry and Debugging Best Practices
panelCategory: "Basics"
date: 2026-06-30
description: Practical ways to debug FTC robot code using telemetry, logging, and systematic isolation.
tags: [software, beginner, completed]
author: Blueprint
published: true
---

A robot that isn't behaving the way you expect is one of the most common situations in FTC programming, and also one of the most frustrating if you don't have a systematic way to figure out what's actually going wrong. Telemetry is the main tool for this: it lets you see what your code thinks is happening in real time, instead of guessing.

## What Telemetry Is

Telemetry is data your robot sends back to the Driver Station screen while it's running. The FTC SDK makes this simple:

```java
telemetry.addData("Motor Power", motor.getPower());
telemetry.addData("Distance", distanceSensor.getDistance(DistanceUnit.CM));
telemetry.update();
```

This shows live values on the Driver Station during a match or test run, which is often the fastest way to answer the question "what is my code actually doing right now?"

## Using Telemetry to Debug

The core debugging technique with telemetry is simple: print out the values you think should explain the behavior you're seeing, then compare what the robot reports against what you expected.

If an arm isn't moving to the right position, print its target position and its current encoder position. If they match but the arm still looks wrong, the problem is likely mechanical (slipping, binding) rather than in your code. If they don't match, the problem is in how your code is calculating or reaching the target.

If a sensor-based behavior isn't working (like a color sensor not detecting a game piece), print the raw sensor reading. This immediately tells you whether the sensor itself is reading something reasonable, or whether your code's threshold or logic for interpreting the reading is the problem.

This kind of targeted telemetry, added specifically to investigate one problem, is usually much faster than trying to read through code and mentally simulate what it does.

## Isolating the Problem

When something isn't working, it helps to narrow down where the problem actually is before trying to fix it. A few useful isolation techniques:

**Test one mechanism at a time.** Write a minimal OpMode that only exercises the one mechanism you're debugging, without the rest of the robot's code running at the same time. This removes the possibility that some other part of the code is interfering.

**Bisect the code.** If you're not sure which part of a longer sequence of code is causing a problem, comment out or bypass the second half and see if the first half behaves correctly on its own. Repeat, narrowing down the range, until you've isolated the specific section causing the issue.

**Check assumptions with telemetry, don't just trust them.** It's easy to assume a sensor is reading correctly, or that a value is what you think it is, without actually checking. Print it and look. A surprising number of bugs turn out to be a value that wasn't what the programmer assumed it was.

## FTC Dashboard for Deeper Debugging

For more involved debugging, especially anything involving live-tuned values (like PID constants) or visualizing a robot's path in real time, FTC Dashboard extends basic telemetry with graphs, field visualization, and live variable tuning without needing to redeploy code for every change. See the dedicated FTC Dashboard guide for setup and usage details.

## Logcat and Android Studio Debugging

Telemetry is great for values you want to see live during a run, but it only keeps a limited amount of recent history and disappears once the run ends. For deeper investigation, especially of crashes or exceptions, Android Studio's Logcat shows the full system log from the Control Hub or phone, including stack traces from crashes, which is often necessary to actually understand why an OpMode stopped unexpectedly.

`System.out.println()` and `RobotLog.d()` calls also show up in Logcat and can be useful for logging information that's too verbose or too detailed for driver station telemetry but still useful when reviewing logs after a run.

## Reproducing Intermittent Bugs

The hardest bugs to fix are the ones that don't happen every time. A few things that help:

- Add telemetry logging even for the "normal" case, not just when something looks wrong, so you have data from both good and bad runs to compare.
- Note the exact conditions when the bug occurs (battery level, specific sequence of driver inputs, field position) and try to identify a pattern rather than treating each occurrence as random.
- If a bug seems to correlate with low battery voltage, brownouts (a temporary voltage drop under high current draw) are a common and often overlooked cause of erratic behavior.

## Common Mistakes

**Removing debug telemetry too early.** It's tempting to strip out telemetry once a problem seems fixed, but leaving a reasonable amount of ongoing telemetry in place makes it much faster to catch a regression or a new related problem later.

**Not checking the simple things first.** Loose wiring, a motor plugged into the wrong port, or a sensor that isn't actually connected are common causes of "broken" behavior that get missed because the debugging jumps straight to complex code logic.

**Debugging on the field instead of on the bench.** Where possible, debug mechanisms on a test bench or in a controlled space rather than only during full field runs. It's much easier to isolate a problem when you're not also managing everything else happening during a full match simulation.

Systematic debugging, using telemetry to check assumptions rather than guessing, is a skill that gets faster with practice and saves enormous amounts of time compared to randomly changing code and hoping something works.
