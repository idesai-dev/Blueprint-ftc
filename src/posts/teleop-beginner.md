---
title: Teleop Beginner
panelCategory: "TeleOp"
date: 2026-06-02
description: Write your first full mecanum TeleOp program with gamepad controls.
tags: [software, manual, beginner, completed]
author: Blueprint
published: true
---

## Your First Mecanum TeleOp

If you have not already, read the [TeleOp Introduction](/teleop-introduction) first. This guide picks up where that one left off and walks you through writing a complete, working mecanum drive TeleOp program from scratch.

By the end of this guide, your robot will drive in all directions with the left stick and rotate with the right stick, just like a good mecanum drive should.

---

## Setting Up the Motors

A mecanum drivetrain uses four motors: front left, front right, back left, and back right. You declare them at the top of your class and then initialize them inside `runOpMode()`.

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.DcMotorSimple;

@TeleOp(name = "Mecanum TeleOp", group = "TeleOp")
public class MecanumTeleOp extends LinearOpMode {

    DcMotor frontLeft, frontRight, backLeft, backRight;

    @Override
    public void runOpMode() {

        // Get motors from hardwareMap using the names set in the Driver Station config
        frontLeft  = hardwareMap.get(DcMotor.class, "frontLeft");
        frontRight = hardwareMap.get(DcMotor.class, "frontRight");
        backLeft   = hardwareMap.get(DcMotor.class, "backLeft");
        backRight  = hardwareMap.get(DcMotor.class, "backRight");

        // Reverse the left side motors so all wheels spin in the correct direction
        frontLeft.setDirection(DcMotorSimple.Direction.REVERSE);
        backLeft.setDirection(DcMotorSimple.Direction.REVERSE);

        telemetry.addData("Status", "Ready");
        telemetry.update();

        waitForStart();

        while (opModeIsActive()) {
            // Driving code goes here
        }
    }
}
```

### Why Reverse the Left Side?

Physically, the motors on the left and right sides of your robot face opposite directions. If you spin all four motors with positive power, the left wheels will spin backward relative to the robot. Reversing the left side motors corrects this so that positive power on all four motors means "drive forward."

> Note: Which side you reverse depends on how your motors are physically mounted. If your robot drives backward when you push the stick forward, try reversing the other side instead.

---

## The Mecanum Math

Mecanum wheels are special: they have rollers set at 45-degree angles, which lets the robot slide sideways in addition to driving forward and backward. The key is sending the right power mix to each wheel.

Here is the formula:

```
frontLeft  = y + x + rx
frontRight = y - x - rx
backLeft   = y - x + rx
backRight  = y + x - rx
```

Where:
- **y** is forward/backward (from `left_stick_y`, negated)
- **x** is left/right strafe (from `left_stick_x`)
- **rx** is rotation (from `right_stick_x`)

In code:

```java
double y  = -gamepad1.left_stick_y;  // negate because forward = negative on Y axis
double x  =  gamepad1.left_stick_x;
double rx =  gamepad1.right_stick_x;

double frontLeftPower  = y + x + rx;
double frontRightPower = y - x - rx;
double backLeftPower   = y - x + rx;
double backRightPower  = y + x - rx;
```

---

## Power Normalization

There is a problem with the formula above: when you combine forward, strafe, and rotation inputs, the result can exceed 1.0, which is the maximum motor power. Sending a value above 1.0 to a motor does nothing extra since the SDK clamps it, but it means your wheel ratios get messed up and the robot will not drive straight.

The fix is to divide all four values by the largest one if it is greater than 1.0. This keeps the ratio between wheels the same while scaling everything down to fit within the valid range.

```java
// Find the largest absolute value among all four motor powers
double denominator = Math.max(Math.abs(y) + Math.abs(x) + Math.abs(rx), 1);

double frontLeftPower  = (y + x + rx) / denominator;
double frontRightPower = (y - x - rx) / denominator;
double backLeftPower   = (y - x + rx) / denominator;
double backRightPower  = (y + x - rx) / denominator;
```

Using `Math.max(..., 1)` means that if the denominator is already less than or equal to 1, we divide by 1 and nothing changes. Division only happens when needed.

---

## Adding a Slow Mode

Slow mode (sometimes called "precision mode") lets drivers reduce the robot speed by holding a button. This is really useful for lining up with scoring targets. A common setup is to hold the left bumper to cut the speed in half.

```java
double speedMultiplier = gamepad1.left_bumper ? 0.5 : 1.0;

double frontLeftPower  = ((y + x + rx) / denominator) * speedMultiplier;
double frontRightPower = ((y - x - rx) / denominator) * speedMultiplier;
double backLeftPower   = ((y - x + rx) / denominator) * speedMultiplier;
double backRightPower  = ((y + x - rx) / denominator) * speedMultiplier;
```

The ternary expression `gamepad1.left_bumper ? 0.5 : 1.0` means: if the left bumper is held, use 0.5; otherwise use 1.0.

---

## Full Working Code

Here is the complete program putting everything together:

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.DcMotorSimple;

@TeleOp(name = "Mecanum TeleOp", group = "TeleOp")
public class MecanumTeleOp extends LinearOpMode {

    DcMotor frontLeft, frontRight, backLeft, backRight;

    @Override
    public void runOpMode() {

        frontLeft  = hardwareMap.get(DcMotor.class, "frontLeft");
        frontRight = hardwareMap.get(DcMotor.class, "frontRight");
        backLeft   = hardwareMap.get(DcMotor.class, "backLeft");
        backRight  = hardwareMap.get(DcMotor.class, "backRight");

        // Reverse the left side so all wheels drive in the same direction
        frontLeft.setDirection(DcMotorSimple.Direction.REVERSE);
        backLeft.setDirection(DcMotorSimple.Direction.REVERSE);

        telemetry.addData("Status", "Ready");
        telemetry.update();

        waitForStart();

        while (opModeIsActive()) {

            // Read gamepad inputs
            double y  = -gamepad1.left_stick_y;  // forward/backward
            double x  =  gamepad1.left_stick_x;  // strafe left/right
            double rx =  gamepad1.right_stick_x; // rotation

            // Slow mode: hold left bumper to move at half speed
            double speedMultiplier = gamepad1.left_bumper ? 0.5 : 1.0;

            // Normalize so no value exceeds 1.0
            double denominator = Math.max(Math.abs(y) + Math.abs(x) + Math.abs(rx), 1);

            // Calculate motor powers
            double frontLeftPower  = ((y + x + rx) / denominator) * speedMultiplier;
            double frontRightPower = ((y - x - rx) / denominator) * speedMultiplier;
            double backLeftPower   = ((y - x + rx) / denominator) * speedMultiplier;
            double backRightPower  = ((y + x - rx) / denominator) * speedMultiplier;

            // Send powers to the motors
            frontLeft.setPower(frontLeftPower);
            frontRight.setPower(frontRightPower);
            backLeft.setPower(backLeftPower);
            backRight.setPower(backRightPower);

            // Display info on Driver Station
            telemetry.addData("FL | FR", "%.2f | %.2f", frontLeftPower, frontRightPower);
            telemetry.addData("BL | BR", "%.2f | %.2f", backLeftPower, backRightPower);
            telemetry.addData("Slow Mode", gamepad1.left_bumper ? "ON" : "OFF");
            telemetry.update();
        }
    }
}
```

---

## Testing Your Code

Once you have uploaded the code:

1. Open the Driver Station app and go to **Configure Robot** to make sure your motor names match exactly: `frontLeft`, `frontRight`, `backLeft`, `backRight`.
2. Select your OpMode and press **INIT**. Check the telemetry for "Ready".
3. Press **START** and test each direction: forward, backward, strafe left, strafe right, and rotation.
4. If a wheel spins the wrong way, try reversing that motor's direction in code.

From here, a great next step is learning how to add attachment control using `gamepad2`, or reading about [Finite State Machines](/teleop-fsm) to manage more complex robot behaviors cleanly.
