---
title: Understanding Loop Times
panelCategory: "Control"
date: 2026-07-01
description: Why your OpMode's loop speed matters, what slows it down, and how to keep it fast.
tags: [software, intermediate, completed]
author: Blueprint
published: true
---

Every FTC OpMode runs as a loop: read inputs, do some calculations, send commands to motors and servos, repeat. How fast that loop runs, usually called loop time or loop frequency, has a real effect on how responsive and precise your robot feels, even though it's easy to ignore until it becomes a visible problem.

## What Loop Time Actually Is

Loop time is how long one pass through your `while (opModeIsActive())` loop takes, from the start of one iteration to the start of the next. A faster loop time means your code checks sensors, updates control logic, and sends new motor commands more often per second.

A slow loop time means there's more delay between a real-world event (a driver moving a joystick, a sensor detecting something) and your robot actually responding to it. For simple driver-controlled movement this delay might not be very noticeable, but for anything relying on tight feedback, like a PID-controlled mechanism trying to hold a precise position, a slow loop time directly limits how well the controller can perform.

## What Slows a Loop Down

A few common causes of slow loop times in FTC code:

**Blocking calls.** Anything that makes your code wait, like `Thread.sleep()`, blocks the entire loop from continuing until it finishes. A `sleep(500)` call means your robot can't respond to anything for half a second, which is a very long time in robot-control terms.

**Excessive telemetry.** Calling `telemetry.update()` sends data over to the Driver Station, which takes real time, more than most people expect. Calling it many times per loop, or sending a large amount of data every single loop, can measurably slow things down.

**Unnecessary hardware reads.** Some sensor and hardware reads (especially over I2C, like certain color or distance sensors) are slower than simple digital reads. Reading the same sensor multiple times per loop when once would do adds up.

**Expensive calculations every loop.** Complex math, especially anything involving trigonometry or repeated recalculation of values that don't actually change often, can add measurable time if it's happening every single loop iteration unnecessarily.

**Inefficient code structure.** Deeply nested loops, unnecessary object creation inside the loop, or redundant work repeated multiple times per iteration all add up, even if each individual piece seems small.

## Measuring Your Loop Time

The simplest way to check your loop time is to time it directly and report it with telemetry:

```java
double loopStartTime = System.currentTimeMillis();

while (opModeIsActive()) {
    double loopTime = System.currentTimeMillis() - loopStartTime;
    loopStartTime = System.currentTimeMillis();

    telemetry.addData("Loop Time (ms)", loopTime);
    telemetry.update();

    // rest of your loop
}
```

This tells you directly how many milliseconds each loop iteration is taking, which you can watch change as you add or remove different pieces of code, giving you a direct way to see what's actually expensive.

## Why This Matters for Control Loops

Any control algorithm that depends on a `dt` (the time elapsed since the last update), like a PID controller or a motion profile follower, assumes that `dt` is being measured and used correctly. If your loop time is inconsistent (sometimes fast, sometimes suddenly slow because of a blocking call or expensive operation), the resulting control behavior can become inconsistent or jittery too, even if the underlying control math is correct.

This is part of why well-written control loops measure actual elapsed time each iteration (rather than assuming a fixed loop time) and use that measured `dt` in their calculations. It makes the controller more robust to loop time variation, but it can't fully compensate for a loop that's consistently too slow to react in time.

## Practical Ways to Keep Loops Fast

**Avoid blocking calls inside the main loop.** If you need a delay, consider whether it's actually necessary, or whether the behavior can be restructured as a state machine that checks a condition each loop instead of sleeping.

**Batch and limit telemetry.** Collect the values you need, then call `telemetry.update()` once per loop rather than multiple times. Consider whether you need to send every single value every single loop, especially very verbose data.

**Cache sensor reads you don't need every iteration.** If a particular sensor reading only needs to be checked occasionally, don't read it on every single loop iteration if it's a comparatively slow read.

**Keep expensive calculations out of hot paths where possible.** If a calculation's inputs haven't changed since the last loop, there's no need to redo it.

## Common Mistakes

**Not measuring loop time at all.** Many teams never actually check their loop time and have no idea whether it's fast or unusually slow. Measuring it, even just occasionally during development, makes performance problems visible instead of invisible.

**Adding `Thread.sleep()` as a quick fix.** It's tempting to add a short sleep to "make something work," but this blocks the whole loop and often introduces exactly the kind of unresponsiveness that causes other problems.

**Assuming loop time doesn't matter for simple mechanisms.** Even a simple mechanism benefits from a fast, consistent loop, since driver input, telemetry, and any sensor-based safety checks all depend on the loop running frequently.

A fast, consistent loop time isn't something drivers will consciously notice when it's working well, but they will absolutely notice when it isn't: sluggish response, jittery mechanism control, and inconsistent autonomous behavior are all downstream of loop timing problems more often than teams expect.
