---
title: Pedro Pathing: Making an Auto
panelCategory: "Pedro Pathing"
date: 2026-06-21
description: Building a complete autonomous routine with Pedro Pathing.
tags: [completed, software, intermediate]
author: Ishaan Desai
published: true
---

<div style="padding: 0.9rem 1.4rem; background: rgba(114, 178, 204, 0.07); border-left: 4px solid var(--accent-cyan); border-radius: 6px; margin-bottom: 1.5rem; font-size: 0.93rem;">
For more detailed information, visit the <a href="https://github.com/Pedro-Pathing" target="_blank" rel="noopener">official Pedro Pathing GitHub</a>.
</div>

# Making an Autonomous Routine with Pedro Pathing

Once your robot is tuned, writing an autonomous routine with Pedro Pathing comes down to a few core classes and a straightforward pattern. Understanding what each piece does makes it much easier to build complex routines without getting lost.

## The Key Classes

`Follower` is the heart of Pedro. It takes your paths as input, runs the motion profile and PID logic internally, and drives the motors. You initialize one instance at the start of your OpMode and call `follower.update()` in a loop to keep it working.

A `Path` is a single trajectory defined by a Bezier curve. For straight-line movement, you use a `BezierLine`. For curves, you use a `BezierCurve` and supply control points that shape the arc. Both take `Point` objects, which are just x/y coordinates in inches measured from the robot's starting position. So `Point(0, 0, Point.CARTESIAN)` is where the robot starts, and `Point(48, 0, Point.CARTESIAN)` is 48 inches directly ahead.

A `PathChain` is a sequence of paths strung together. When you use a PathChain instead of individual Paths, Pedro transitions between segments smoothly without stopping in between. For any routine with more than one move, PathChains are almost always the right choice.

## The Basic Pattern

Your autonomous class extends `LinearOpMode`. In `runOpMode()`, initialize the follower, define your PathChains, call `waitForStart()`, then run through your sequence. Each move follows the same structure: tell the follower to follow the path, then loop calling `follower.update()` until it's done. The `follower.update()` call is non-blocking, which means you can run other code inside that loop - like updating a subsystem or writing telemetry.

Here's a simple single-path example that moves the robot from its starting position to a point 100 inches out at a 45-degree angle:

```java
@Autonomous(name = "Basic Auto")
public class BasicAuto extends LinearOpMode {
    public Follower follower;

    @Override
    public void runOpMode() {
        // Initialize the follower
        follower = new Follower(hardwareMap);

        // Define your path
        Path path = new Path(new BezierLine(new Point(0, 0, Point.CARTESIAN), new Point(100, 100, Point.CARTESIAN)));

        waitForStart();

        // Follow the path
        follower.followPath(path);

        // Update the follower
        while (opModeIsActive() && follower.isFollowing()) {
            follower.update();
        }
    }
}
```

## Chaining Multiple Moves

For routines with multiple movements, build a PathChain using `follower.pathBuilder()`. The builder lets you chain as many segments as you want, and Pedro will handle the transitions. The `true` parameter in `followPath(route, true)` tells Pedro to hold the robot at the final pose after the chain finishes, rather than letting it coast.

Here's an example that drives forward 48 inches and then strafes right 24 inches:

```java
// Chain: forward 48 inches, then strafe right 24 inches
PathChain route = follower.pathBuilder()
    .addPath(new BezierLine(new Point(0, 0, Point.CARTESIAN), new Point(48, 0, Point.CARTESIAN)))
    .addPath(new BezierLine(new Point(48, 0, Point.CARTESIAN), new Point(48, 24, Point.CARTESIAN)))
    .build();

follower.followPath(route, true);
while (opModeIsActive() && follower.isFollowing()) {
    follower.update();
}
```

Notice that the second path starts where the first one ended. Pedro doesn't reset the coordinate system between segments - your points are always relative to the robot's starting position at the beginning of the OpMode.

## Integrating Subsystems

Because `follower.update()` is non-blocking, you can do other work inside the following loop. If you need to run an intake, extend an arm, or update a servo position while the robot is moving, just add those calls inside the `while` loop alongside `follower.update()`. This is one of Pedro's biggest practical advantages - your robot can be driving and doing something at the same time without any threading complexity on your end.

As your routine grows, define all of your PathChains before `waitForStart()` so they're prebuilt and ready to run. This keeps the execution portion of your OpMode clean and easy to read.
