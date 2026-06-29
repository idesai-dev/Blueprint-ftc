---
title: Types of OpModes
panelCategory: "Basics"
date: 2026-04-22
description: The core differences between an OpMode and a LinearOpMode with Java examples.
tags: [completed, software, beginner, video]
author: Ishaan Desai
published: true
---

# Types of OpModes

When you write FTC robot code, every program you create is called an OpMode. The FTC SDK gives you two base classes to choose from: `OpMode` and `LinearOpMode`. They both do the same job at a high level, but the way you write code inside them is pretty different. Knowing which one to use, and why, will save you a lot of confusion early on.

---

## OpMode

The `OpMode` class (also called an Iterative OpMode) works like a state machine. It has a set of lifecycle methods that the SDK calls automatically at specific times:

- `init()` runs once when the driver presses Init.
- `init_loop()` runs repeatedly while waiting for Start.
- `start()` runs once when the driver presses Start.
- `loop()` runs repeatedly throughout the match.
- `stop()` runs once when the OpMode ends.

You fill in whichever of these methods you need. The SDK takes care of calling them at the right time. The key thing to understand is that the `loop()` method is called over and over by the SDK at a very fast rate, and you are not in control of that cycle. Your job is just to handle one frame of logic each time it gets called.

> [!WARNING]
> Never put a `while()` loop or `Thread.sleep()` inside the `loop()` method. Because the SDK is already looping for you, blocking inside `loop()` will freeze the entire robot and crash the app.

---

## Linear OpMode

A `LinearOpMode` runs from top to bottom inside a single method called `runOpMode()`. There's no splitting things across multiple lifecycle methods. You initialize your hardware, call `waitForStart()` to pause until the driver presses play, and then write your own loop with `while (opModeIsActive())`.

This structure is much easier to reason about when you're starting out, especially for autonomous routines where you want to do things in a specific order. It also lets you use blocking calls like `sleep()`, which is useful when you need to wait a specific amount of time for a mechanism to finish moving before doing the next thing.

Most FTC teams, especially beginners, use `LinearOpMode` for both TeleOp and autonomous. It's the format used in most guides and examples, including ours.

---

## The Difference in Code

Here's the same basic program written both ways: initialize a motor, wait for start, then run it at full power.

### Iterative OpMode Example

```java
@TeleOp(name="Basic Iterative")
public class BasicIterative extends OpMode {
    DcMotor motor;

    @Override
    public void init() {
        motor = hardwareMap.get(DcMotor.class, "motor");
    }

    @Override
    public void loop() {
        // This repeatedly runs incredibly fast! No while loops here.
        motor.setPower(1.0);
    }
}
```

### Linear OpMode Example

```java
@TeleOp(name="Basic Linear")
public class BasicLinear extends LinearOpMode {
    DcMotor motor;

    @Override
    public void runOpMode() throws InterruptedException {
        // 1. Initialization code
        motor = hardwareMap.get(DcMotor.class, "motor");

        // 2. Wait for the play button
        waitForStart();

        // 3. Loop while the match is running
        while (opModeIsActive()) {
            motor.setPower(1.0);
        }
    }
}
```

Both programs do the same thing. The Iterative version splits initialization and runtime into separate methods, while the Linear version keeps it all in one place and gives you explicit control over the timing. For most newcomers, the Linear version is easier to follow and is the better place to start.
