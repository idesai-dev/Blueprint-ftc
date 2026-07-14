---
title: Bulk Reads
panelCategory: "Miscellaneous"
date: 2026-05-18
description: Optimizing your FTC robot's control loop with LynxModule bulk reading.
tags: [completed, software, intermediate, performance]
author: Blueprint
published: true
---

Bulk reading is one of the most impactful optimizations you can make to your robot code, and it only takes a few lines to set up.

Here is the problem: in a standard FTC OpMode, every time you call something like `motor.getCurrentPosition()`, the SDK sends a separate request over I2C or serial to the Control Hub or Expansion Hub, then waits for a response. Do that a dozen times per loop iteration and your loop slows to a crawl. You end up running at 40-60 Hz when you could be running much faster.

Bulk reads solve this by fetching all of the hub's data (encoder positions, sensor values, everything) in a single efficient request. Your code then reads from that cached snapshot instead of making individual hardware calls.

## Setting It Up

You access bulk reads through the `LynxModule` class, which represents each REV hub in your system.

```java
public void initBulkReads() {
    List<LynxModule> allHubs = hardwareMap.getAll(LynxModule.class);

    for (LynxModule hub : allHubs) {
        hub.setBulkCachingMode(LynxModule.BulkCachingMode.AUTO);
    }
}
```

Call this once during initialization and you are done. That is all you need for the most common use case.

## The Three Modes

There are three caching modes to choose from. They differ in how and when the cached data gets refreshed.

**OFF** is the default. No bulk reading happens at all. Every sensor or motor read is its own separate hardware call. This is the slowest option and there is almost never a reason to stay in this mode intentionally.

**AUTO** is the mode most teams should use. The SDK automatically performs a bulk read when it needs fresh data and clears the cache once per control loop iteration. You get a massive speed boost with zero extra code in your loop. Start here.

**MANUAL** gives you the most control. You are responsible for clearing the cache yourself at the start of each loop iteration. This guarantees you always have fresh data and lets you control exactly when the hub gets queried. It is more work, but it is the right choice for performance-critical code like odometry.

```java
// At the start of your while(opModeIsActive()) loop:
for (LynxModule hub : allHubs) {
    hub.clearBulkCache();
}
```

Make sure you hold onto the `allHubs` list as a field so you can access it inside the loop.

## Why This Matters

The difference is real. Without bulk reads, a typical loop runs at 40-60 Hz. With AUTO or MANUAL mode enabled, you can hit 100-200 Hz depending on how much else your code is doing. Faster loops mean your PID controllers react more quickly and your odometry stays more accurate. For competitive teams running tight autonomous routines, this is worth doing.
