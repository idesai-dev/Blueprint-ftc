---
title: Subsystem Architecture and Code Organization
panelCategory: "Basics"
date: 2026-06-29
description: How to structure FTC robot code into subsystems so it stays readable as it grows.
tags: [software, intermediate, completed]
author: Blueprint
published: true
---

A lot of FTC teams start the season with a single, giant OpMode file that directly controls every motor and servo inline. This works fine for a simple robot with two or three mechanisms, but it quickly becomes hard to read, hard to reuse between TeleOp and Autonomous, and hard to debug once a robot has five or six mechanisms with their own logic. Organizing code into subsystems fixes this.

## What a Subsystem Is

A subsystem is a class that represents one physical mechanism on the robot, like the drivetrain, the intake, or the lift, and owns everything needed to control it: the motor and sensor objects, the methods to move it, and any internal state (like a target position) it needs to track.

Instead of your OpMode directly calling `armMotor.setPower(0.5)`, it calls something like `arm.setPower(0.5)` or `arm.moveToPosition(HIGH)`, and the `Arm` class handles the actual hardware calls internally. This might seem like a small difference, but it changes a lot about how maintainable your code is.

## A Simple Example

```java
public class Intake {
    private DcMotor motor;

    public Intake(HardwareMap hardwareMap) {
        motor = hardwareMap.get(DcMotor.class, "intakeMotor");
    }

    public void intake() {
        motor.setPower(1.0);
    }

    public void outtake() {
        motor.setPower(-1.0);
    }

    public void stop() {
        motor.setPower(0);
    }
}
```

Now both your TeleOp and Autonomous OpModes can create an `Intake` object and call `intake()`, `outtake()`, or `stop()` without either one needing to know the actual motor name, port, or power values. If you later change how the intake works internally (add a sensor, change the power level, add a delay), you change it in one place, and every OpMode that uses `Intake` picks up the change automatically.

## Why This Matters as Robots Get More Complex

**Reuse between OpModes.** Without subsystems, it's common to end up duplicating hardware setup and control logic between your TeleOp and Autonomous OpModes, then having them slowly drift out of sync as one gets updated and the other doesn't. With subsystems, both OpModes use the same class, so there's only one place for that logic to live.

**Easier debugging.** If the intake is misbehaving, you know exactly which file to look in. Without subsystems, intake logic might be scattered across multiple OpModes, each with slightly different implementations.

**Testability.** It's much easier to test one subsystem in isolation (write a tiny OpMode that just exercises the `Arm` class) than to test a single giant OpMode that controls everything at once.

**Clearer collaboration.** On a team with multiple programmers, subsystems let people work on different mechanisms without stepping on each other's code. One person can work on `Intake` while another works on `Drivetrain`, and they only need to coordinate at the point where the main OpMode uses both.

## Structuring a Robot Class

Many teams go one level further and create a `Robot` class that owns all the subsystems, so an OpMode just creates one `Robot` object instead of individually initializing every mechanism.

```java
public class Robot {
    public Drivetrain drivetrain;
    public Intake intake;
    public Lift lift;

    public Robot(HardwareMap hardwareMap) {
        drivetrain = new Drivetrain(hardwareMap);
        intake = new Intake(hardwareMap);
        lift = new Lift(hardwareMap);
    }
}
```

An OpMode then looks like:

```java
Robot robot = new Robot(hardwareMap);
// later, in the loop:
robot.intake.intake();
robot.lift.moveToPosition(Lift.Position.HIGH);
```

This keeps the OpMode focused on high-level decisions (what should happen and when) while the subsystem classes handle the low-level details of how each mechanism actually works.

## How Far to Take It

Subsystems are a tool, not a rulebook. A very simple mechanism (a single servo that only ever opens and closes) might not need its own full class; a couple of well-named constants and a helper method might be enough. The value of a subsystem grows with the complexity of the mechanism it represents: more motors, more sensors, more internal state, or more places in the code that need to control it all make a dedicated subsystem more worthwhile.

Don't feel pressure to over-engineer a simple robot. The goal is code that's easy to read, easy to reuse, and easy to debug, not architecture for its own sake.

## Common Mistakes

**Giant OpModes with everything inline.** The clearest sign it's time to introduce subsystems is an OpMode file that's hundreds of lines long, mixing hardware setup, control logic, and driver input handling all in one place.

**Subsystems that reach into each other's internals.** A subsystem should generally expose methods (`intake()`, `moveToPosition()`) rather than public raw motor objects that other code pokes at directly. This keeps the internal details of how a mechanism works contained to its own class.

**Duplicating hardware setup between TeleOp and Autonomous.** If you find yourself copying the same `hardwareMap.get(...)` calls into multiple OpModes, that's a strong signal those mechanisms belong in a shared subsystem class instead.

Organizing code into subsystems is one of the highest-leverage changes a team can make early in the season. It costs a bit of extra structure upfront, but it pays off every time you add a new mechanism, debug a problem, or bring a new programmer onto the team.
