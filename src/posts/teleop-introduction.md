---
title: Teleop Introduction
panelCategory: "TeleOp"
date: 2026-05-30
description: An introduction to the TeleOp period and how to structure your first TeleOp program.
tags: [software, manual, beginner, completed]
author: Blueprint
published: true
---

## What Is TeleOp?

In FTC, every match is split into two parts: a 30-second autonomous period where your robot runs on its own, and a 2.5-minute **TeleOp period** (short for "teleoperated") where your drivers take control using gamepads. TeleOp is where most of your scoring happens, so writing clean, responsive code here matters just as much as building a solid robot.

During TeleOp, your robot needs to react to gamepad inputs in real time. That means your code has to run inside a continuous loop, constantly reading the gamepad and updating motor powers. This guide walks you through how that loop is structured and what you need to know before writing your first TeleOp program.

---

## The Two Gamepads

FTC allows two gamepads connected to the Driver Station. By convention:

- **gamepad1** is used by the **driver**, who focuses on moving the robot around the field.
- **gamepad2** is used by the **operator**, who controls attachments like arms, claws, or slides.

You access them in code like this:

```java
double forward = -gamepad1.left_stick_y;
boolean clawClose = gamepad2.a;
```

Common gamepad inputs include:
- **Joysticks**: `left_stick_x`, `left_stick_y`, `right_stick_x`, `right_stick_y` (values from -1.0 to 1.0)
- **Bumpers**: `left_bumper`, `right_bumper` (boolean, true or false)
- **Triggers**: `left_trigger`, `right_trigger` (values from 0.0 to 1.0)
- **Buttons**: `a`, `b`, `x`, `y`, `dpad_up`, `dpad_down`, and more (boolean)

### The Left Stick Y Gotcha

Here is something that trips up almost every beginner. When you push the left stick **forward**, `left_stick_y` returns a **negative** value. That is just how the SDK works, and it means if you forget to negate it, pushing forward will drive your robot backward.

Always negate `left_stick_y` when you mean "forward":

```java
double forward = -gamepad1.left_stick_y; // negate so pushing forward gives a positive value
```

Keep this in mind any time you use a Y-axis joystick value.

---

## Structure of a TeleOp LinearOpMode

FTC programs are called **OpModes**. For TeleOp, you will almost always use `LinearOpMode` as your base class. Here is what the skeleton of a TeleOp looks like:

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "My TeleOp", group = "TeleOp")
public class MyTeleOp extends LinearOpMode {

    @Override
    public void runOpMode() {

        // --- INIT PHASE ---
        // Hardware setup goes here. The robot is NOT moving yet.
        // This runs before the driver presses START.

        telemetry.addData("Status", "Initialized");
        telemetry.update();

        // Wait for the driver to press START
        waitForStart();

        // --- TELEOP LOOP ---
        // This loop runs repeatedly until the match ends or STOP is pressed.
        while (opModeIsActive()) {

            // Read gamepad inputs and update motors/servos here

            telemetry.addData("Status", "Running");
            telemetry.update();
        }
    }
}
```

There are three distinct phases here:

1. **Init phase**: Everything before `waitForStart()`. Use this to grab your motors and servos from `hardwareMap`, set directions, and print a ready message. The robot sits still during this phase.
2. **`waitForStart()`**: The program pauses here until the referee starts the match and the driver presses START on the gamepad. Never put motor movement before this line.
3. **The `while(opModeIsActive())` loop**: This is your main loop. It runs over and over, as fast as the robot's processor allows, until the match ends. All your gamepad reading and motor control goes inside here.

---

## What Is Telemetry?

**Telemetry** is how your robot sends information back to the Driver Station screen while it runs. It is incredibly useful for debugging during practice and for giving drivers live feedback during competition.

```java
telemetry.addData("Label", value);
telemetry.update(); // MUST call this to actually send the data to the screen
```

You can add as many data lines as you want before calling `update()`. For example:

```java
telemetry.addData("Forward Power", forward);
telemetry.addData("Strafe Power", strafe);
telemetry.addData("Rotation", rotate);
telemetry.update();
```

A few tips:
- Always call `telemetry.update()` once per loop iteration, at the end of the loop.
- Use telemetry to display motor powers, sensor readings, and current robot states. This saves you hours of debugging.
- During competition, drivers can glance at the Driver Station to see useful info like "Claw: OPEN" or "Slide Position: 1200 ticks".

> Think of telemetry like the dashboard in a car. You could drive without it, but knowing your speed and status makes everything easier.

---

## What Comes Next

Now that you understand the structure of TeleOp, you are ready to write your first real driving code. The [TeleOp Beginner guide](/teleop-beginner) walks you through setting up a full mecanum drivetrain with gamepad controls, explaining the mecanum math, power normalization, and adding a slow mode button.

Once you are comfortable with basic driving, the [Finite State Machines guide](/teleop-fsm) shows you how to manage more complex behaviors like toggling a claw or moving a slide to preset positions, all without your code turning into a mess.
