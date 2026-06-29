---
title: Encoder Autonomous Introduction
panelCategory: "Encoder Based"
date: 2026-06-08
description: Getting started with encoder-based autonomous operations.
tags: [software, auto, beginner, completed]
author: Blueprint
published: true
---

# Encoder Autonomous Introduction

The Autonomous period is the first 30 seconds of every FTC match. During this time, your robot has to act entirely on its own. No drivers, no joysticks, no manual corrections. Whatever code you write beforehand is exactly what the robot will run.

Getting your robot to move predictably during autonomous is one of the most important skills in FTC. If your robot drifts off course or overshoots a target, it can cost you precious points. This is where encoders come in.

---

## What Is an Encoder?

An encoder is a sensor built directly into the motor. As the motor shaft spins, the encoder counts how many times it rotates. These counts are called **ticks**. The more ticks, the more the motor has rotated.

The number of ticks per full revolution depends on which motor you are using:

- **goBILDA Yellow Jacket 312 RPM:** 537.7 ticks per revolution
- **goBILDA Yellow Jacket 435 RPM:** 383.6 ticks per revolution

By reading the tick count, your code can know exactly how far a motor has spun, which means you can calculate how far your robot has moved. This makes your autonomous consistent and repeatable, even across multiple matches.

---

## Why Use Encoders in Autonomous?

You could write an autonomous that just sets motor power for a fixed amount of time. This is called time-based autonomous. The problem is that time-based movement is unreliable. Battery voltage changes throughout a match, friction varies by surface, and a slight bump from another robot can throw everything off.

Encoder-based autonomous is far more consistent because it measures actual shaft rotation rather than guessing based on time. If you tell the robot to drive 24 inches, it will drive 24 inches regardless of battery level or minor surface differences.

---

## The 4 RunModes

Before you can use encoders effectively, you need to understand the four RunModes that the FTC SDK provides. Every motor has a `RunMode` that controls how it behaves.

**`RUN_WITHOUT_ENCODER`**
This mode ignores the encoder completely. The motor runs at whatever raw power you give it. This is what you typically use in TeleOp when you want direct joystick control.

**`RUN_USING_ENCODER`**
The encoder is active, but the motor uses it for velocity control, not position. This helps the motor maintain a more consistent speed even as the battery drains. You will use this mode as a resting state between movements in autonomous.

**`STOP_AND_RESET_ENCODER`**
This is not really a running mode. Setting this mode resets the encoder tick count back to zero. You should do this at the start of your autonomous to make sure you are starting from a known position.

**`RUN_TO_POSITION`**
This is the workhorse of encoder-based autonomous. You give the motor a target tick count, set a power level, and the motor drives until it reaches that position. It handles the stopping logic on its own.

---

## Resetting Encoders at the Start

Before you do anything else in your autonomous, reset all your drive motor encoders. This ensures your tick counts start at zero and your distance calculations are accurate.

```java
frontLeft.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
frontRight.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
backLeft.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
backRight.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
```

After resetting, switch to `RUN_USING_ENCODER` so your motors are ready to accept movement commands:

```java
frontLeft.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
frontRight.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
backLeft.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
backRight.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
```

Skipping the reset is a common mistake. If your motors still have tick counts from a previous run, your distance calculations will be wrong from the start.

---

## A Simple Example: Driving Forward

Here is a minimal example showing how to drive forward using encoders. This gives you the basic idea before we build out full helper functions.

```java
@Autonomous(name = "Encoder Intro Example")
public class EncoderIntroExample extends LinearOpMode {

    DcMotor frontLeft, frontRight, backLeft, backRight;

    // Approximate ticks per inch for goBILDA 312 RPM with 96mm mecanum wheels
    // You should calibrate this value for your specific robot!
    static final double TICKS_PER_INCH = 45.0;

    @Override
    public void runOpMode() {
        frontLeft  = hardwareMap.get(DcMotor.class, "frontLeft");
        frontRight = hardwareMap.get(DcMotor.class, "frontRight");
        backLeft   = hardwareMap.get(DcMotor.class, "backLeft");
        backRight  = hardwareMap.get(DcMotor.class, "backRight");

        // Set motor directions for a typical mecanum drivetrain
        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        // Reset encoders
        frontLeft.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        frontRight.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        backLeft.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        backRight.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);

        // Ready to run
        frontLeft.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        frontRight.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        backLeft.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        backRight.setMode(DcMotor.RunMode.RUN_USING_ENCODER);

        waitForStart();

        // Drive forward 24 inches
        int ticks = (int)(24 * TICKS_PER_INCH);

        frontLeft.setTargetPosition(ticks);
        frontRight.setTargetPosition(ticks);
        backLeft.setTargetPosition(ticks);
        backRight.setTargetPosition(ticks);

        frontLeft.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        frontRight.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        backLeft.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        backRight.setMode(DcMotor.RunMode.RUN_TO_POSITION);

        frontLeft.setPower(0.5);
        frontRight.setPower(0.5);
        backLeft.setPower(0.5);
        backRight.setPower(0.5);

        // Wait until motors reach their target
        while (opModeIsActive() && (frontLeft.isBusy() && frontRight.isBusy())) {
            telemetry.addData("Front Left Ticks", frontLeft.getCurrentPosition());
            telemetry.addData("Front Right Ticks", frontRight.getCurrentPosition());
            telemetry.update();
        }

        // Stop all motors
        frontLeft.setPower(0);
        frontRight.setPower(0);
        backLeft.setPower(0);
        backRight.setPower(0);
    }
}
```

Notice that you call `setTargetPosition()` before switching to `RUN_TO_POSITION`. That order matters. You also need to check both `opModeIsActive()` and `isBusy()` in your while loop. The `opModeIsActive()` check makes sure your code stops cleanly when the 30-second period ends.

---

## What Comes Next

This example works, but writing `setTargetPosition` for all four motors every time you want to move gets repetitive fast. The next two guides show you how to clean this up with helper functions.

- **Drivetrain Functions:** How to write reusable `driveForward`, `strafeRight`, and `turnRight` methods that handle all the motor setup for you.
- **Subsystem Functions:** How to control arms, claws, and linear slides using the same encoder patterns.
