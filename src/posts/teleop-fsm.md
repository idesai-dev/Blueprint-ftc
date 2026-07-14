---
title: Finite State Machines in TeleOp
panelCategory: "TeleOp"
date: 2026-06-05
description: Use finite state machines to manage complex robot states cleanly in TeleOp.
tags: [software, manual, intermediate, completed]
author: Blueprint
published: true
---

## The Problem With Simple Button Checks

Let's say you want button A to open the claw when it's closed and close it when it's open. A simple approach might look like this:

```java
if (gamepad2.a) {
    clawServo.setPosition(0.8); // open
}
```

But that only opens it. You need it to toggle. So maybe you add an `else`:

```java
if (gamepad2.a) {
    clawServo.setPosition(0.8);
} else {
    clawServo.setPosition(0.2);
}
```

Now the claw is never closed, because A is not held down during the whole match. You try using a boolean flag. That kind of works, but then the claw flickers because the button is detected as "pressed" for many loop iterations in a row. Things get messy fast.

This is the problem that **Finite State Machines** (FSMs) solve cleanly.

---

## What Is a Finite State Machine?

A Finite State Machine is a way of organizing your code around **states**. The robot can only be in one state at a time, and an event (like a button press) causes it to **transition** to a different state.

A traffic light is a familiar example. It can be GREEN, YELLOW, or RED. It is never GREEN and RED at the same time. That is exactly the idea: a fixed set of possible states, and clear rules for how you move between them.

In FTC, you might use states like:
- A claw that is either `OPEN` or `CLOSED`
- A linear slide that is `RETRACTED`, `LOW`, or `HIGH`
- An intake that is `RUNNING`, `STOPPED`, or `REVERSING`

Using FSMs makes your code much easier to read, debug, and expand.

---

## Defining States with Java Enums

Java has a built-in feature called an `enum` that is perfect for this. An enum is just a named list of constants.

```java
enum ClawState {
    OPEN,
    CLOSED
}

enum SlideState {
    RETRACTED,
    LOW,
    HIGH
}
```

You declare these inside your OpMode class (or as separate files for bigger projects). Then you track the current state with a variable:

```java
ClawState clawState = ClawState.CLOSED;
SlideState slideState = SlideState.RETRACTED;
```

---

## The Rising Edge Detection Pattern

The biggest gotcha with button-triggered state transitions is that `gamepad2.a` returns `true` for every loop iteration while the button is held. On a typical robot, the loop runs hundreds of times per second. That means one button press could trigger your state machine hundreds of times.

The solution is **rising edge detection**: only fire the transition on the very first loop where the button is `true`, not on every loop it stays held.

You do this by tracking the previous state of the button:

```java
boolean prevA = false; // was A pressed last loop?

// Inside the loop:
boolean currA = gamepad2.a;

if (currA && !prevA) {
    // Button was just pressed this loop (rising edge)
    // Safe to trigger the state transition here
}

prevA = currA; // update for next loop
```

The condition `currA && !prevA` is true only on the single loop where A goes from "not pressed" to "pressed." This is the pattern you will use for almost every toggle button in FTC.

---

## Full Example: Claw and Slide FSM

Here is a complete example combining mecanum drive, a claw with two states, and a slide with three states.

The controls are:
- **gamepad2.a**: Toggle claw between OPEN and CLOSED
- **gamepad2.dpad_up**: Set slide to HIGH
- **gamepad2.dpad_down**: Set slide to LOW
- **gamepad2.b**: Retract slide

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.DcMotorSimple;
import com.qualcomm.robotcore.hardware.Servo;

@TeleOp(name = "FSM TeleOp", group = "TeleOp")
public class FSMTeleOp extends LinearOpMode {

    // --- State Enums ---
    enum ClawState {
        OPEN,
        CLOSED
    }

    enum SlideState {
        RETRACTED,
        LOW,
        HIGH
    }

    // --- Hardware ---
    DcMotor frontLeft, frontRight, backLeft, backRight;
    DcMotor slideMotor;
    Servo clawServo;

    // --- State Variables ---
    ClawState clawState   = ClawState.CLOSED;
    SlideState slideState = SlideState.RETRACTED;

    // --- Previous Button States (for rising edge detection) ---
    boolean prevA     = false;
    boolean prevDUp   = false;
    boolean prevDDown = false;
    boolean prevB     = false;

    // --- Slide Target Positions (in encoder ticks) ---
    static final int SLIDE_RETRACTED = 0;
    static final int SLIDE_LOW       = 600;
    static final int SLIDE_HIGH      = 1400;

    // --- Claw Servo Positions ---
    static final double CLAW_OPEN   = 0.7;
    static final double CLAW_CLOSED = 0.2;

    @Override
    public void runOpMode() {

        // Initialize drive motors
        frontLeft  = hardwareMap.get(DcMotor.class, "frontLeft");
        frontRight = hardwareMap.get(DcMotor.class, "frontRight");
        backLeft   = hardwareMap.get(DcMotor.class, "backLeft");
        backRight  = hardwareMap.get(DcMotor.class, "backRight");

        frontLeft.setDirection(DcMotorSimple.Direction.REVERSE);
        backLeft.setDirection(DcMotorSimple.Direction.REVERSE);

        // Initialize slide motor with encoder
        slideMotor = hardwareMap.get(DcMotor.class, "slideMotor");
        slideMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        slideMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        slideMotor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);

        // Initialize claw servo
        clawServo = hardwareMap.get(Servo.class, "clawServo");
        clawServo.setPosition(CLAW_CLOSED); // start closed

        telemetry.addData("Status", "Ready");
        telemetry.update();

        waitForStart();

        while (opModeIsActive()) {

            // ======================
            // DRIVE
            // ======================
            double y  = -gamepad1.left_stick_y;
            double x  =  gamepad1.left_stick_x;
            double rx =  gamepad1.right_stick_x;

            double denominator = Math.max(Math.abs(y) + Math.abs(x) + Math.abs(rx), 1);

            frontLeft.setPower((y + x + rx) / denominator);
            frontRight.setPower((y - x - rx) / denominator);
            backLeft.setPower((y - x + rx) / denominator);
            backRight.setPower((y + x - rx) / denominator);

            // ======================
            // CLAW FSM
            // ======================
            boolean currA = gamepad2.a;

            // Rising edge: only trigger on the first loop the button is pressed
            if (currA && !prevA) {
                if (clawState == ClawState.CLOSED) {
                    clawState = ClawState.OPEN;
                } else {
                    clawState = ClawState.CLOSED;
                }
            }

            prevA = currA; // save for next loop

            // Apply the claw state to the servo
            switch (clawState) {
                case OPEN:
                    clawServo.setPosition(CLAW_OPEN);
                    break;
                case CLOSED:
                    clawServo.setPosition(CLAW_CLOSED);
                    break;
            }

            // ======================
            // SLIDE FSM
            // ======================
            boolean currDUp   = gamepad2.dpad_up;
            boolean currDDown = gamepad2.dpad_down;
            boolean currB     = gamepad2.b;

            if (currDUp && !prevDUp) {
                slideState = SlideState.HIGH;
            } else if (currDDown && !prevDDown) {
                slideState = SlideState.LOW;
            } else if (currB && !prevB) {
                slideState = SlideState.RETRACTED;
            }

            prevDUp   = currDUp;
            prevDDown = currDDown;
            prevB     = currB;

            // Apply the slide state: set target position and run to it
            int slideTarget;
            switch (slideState) {
                case HIGH:      slideTarget = SLIDE_HIGH;      break;
                case LOW:       slideTarget = SLIDE_LOW;       break;
                default:        slideTarget = SLIDE_RETRACTED; break;
            }

            slideMotor.setTargetPosition(slideTarget);
            slideMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
            slideMotor.setPower(0.8); // power to use while moving to position

            // ======================
            // TELEMETRY
            // ======================
            telemetry.addData("Claw State",  clawState);
            telemetry.addData("Slide State", slideState);
            telemetry.addData("Slide Pos",   slideMotor.getCurrentPosition());
            telemetry.addData("Slide Target", slideTarget);
            telemetry.update();
        }
    }
}
```

---

## Breaking It Down

A few things worth calling out in the code above:

**Enums inside the class** work just fine in Java. You can also declare them outside the class or in a separate file as your codebase grows.

**`RUN_TO_POSITION` mode** on the slide motor lets the motor control library handle the movement for you. You just set a target position and power, and the motor drives itself there and holds.

**`BRAKE` zero power behavior** means the slide motor holds its position when power is reduced. This prevents the slide from sagging under gravity.

**Multiple buttons for the slide** instead of a toggle because having dedicated buttons for preset positions is generally more reliable in competition. You always know exactly what state the slide will go to.

---

## When to Use FSMs

FSMs are the right tool any time you have:
- A mechanism that needs to switch between a known set of modes
- A toggle button behavior
- Sequences where one action should not interrupt another unexpectedly
- Multiple subsystems that need to track their own independent states

As your robot gets more complex, you will find yourself reaching for FSMs constantly. They are one of the most useful patterns in FTC software. Once you are comfortable with these basics, check out resources like [gm0.org](https://gm0.org) for more advanced state machine patterns used by top teams.
