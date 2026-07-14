---
title: Touch Sensor
panelCategory: "Sensors"
date: 2026-05-03
description: Simple digital inputs for limit switches and button presses.
tags: [software, completed, beginner]
author: Blueprint
published: true
---

The touch sensor is a simple digital switch. It either says "pressed" or "not pressed." That's it. Simple, reliable, and really useful.

> [!NOTE]
> Even though it's called a "Touch" sensor, you can use it exactly like a limit switch or a button. Use the `TouchSensor` class and call `isPressed()`, which returns `true` when the sensor is being pressed.

---

## Setting It Up

Initialize the sensor using the `TouchSensor` class. No mode setting required, and `isPressed()` gives you a clean `true`/`false` without any inverted logic to worry about.

```java
import com.qualcomm.robotcore.hardware.TouchSensor;

TouchSensor touchSensor = hardwareMap.get(TouchSensor.class, "touchSensor");
```

Reading the state is straightforward:

```java
if (touchSensor.isPressed()) {
    telemetry.addData("Touch", "IS PRESSED");
} else {
    telemetry.addData("Touch", "Not Pressed");
}
```

## Using It as a Limit Switch

This is one of the best uses for a touch sensor. If you have a lift or an arm, put a touch sensor at the bottom (or top) of its travel range. When the mechanism hits the sensor, you can do two things:

1. **Stop the motor** right away to prevent damage.
2. **Reset the encoder** to zero so your software always knows exactly where it is.

```java
if (touchSensor.isPressed() && slideMotor.getPower() < 0) {
    // Stop and zero the encoder when it hits the bottom
    slideMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
    slideMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
}
```

This is really valuable during autonomous. If you reset the encoder every time the lift hits the bottom, your position tracking stays accurate even if something slips during a match.

## Single-Press Logic (Debouncing)

If you want to toggle something when the sensor is pressed, you need to make sure it only triggers once per press instead of firing every loop iteration. The trick is to compare the current state to the previous state and only act when the state changes from unpressed to pressed.

```java
boolean lastState = false;
boolean clawOpen = false;

// Inside your loop:
boolean currentState = touchSensor.isPressed();
if (currentState && !lastState) {
    // This only runs the moment the sensor is FIRST pressed
    clawOpen = !clawOpen;
}
lastState = currentState;
```

This pattern, called debouncing, works the same way whether you're using a touch sensor, a gamepad button, or any other on/off input.

---

Here is a complete example that uses the touch sensor as a limit switch for a simple lift motor.

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.TouchSensor;
import com.qualcomm.robotcore.hardware.DcMotor;

@TeleOp(name = "Touch Sensor Limit Switch Example", group = "Sensor")
public class TouchSensorExample extends LinearOpMode {

    private TouchSensor limitSwitch;
    private DcMotor liftMotor;

    @Override
    public void runOpMode() {
        // 1. Initialize hardware
        limitSwitch = hardwareMap.get(TouchSensor.class, "touchSensor");
        liftMotor = hardwareMap.get(DcMotor.class, "liftMotor");

        telemetry.addData("Status", "Initialized");
        telemetry.update();

        waitForStart();

        while (opModeIsActive()) {
            // 2. Control motor with joystick
            double liftPower = -gamepad1.left_stick_y;

            // 3. Limit switch logic: isPressed() returns true when pressed
            boolean isPressed = limitSwitch.isPressed();

            if (isPressed && liftPower < 0) {
                // At the bottom, stop and reset encoder
                liftMotor.setPower(0);
                liftMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
                liftMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
                telemetry.addData("Limit", "LIFT AT BOTTOM");
            } else {
                liftMotor.setPower(liftPower);
                telemetry.addData("Limit", "Normal Operation");
            }

            // 4. Telemetry output
            telemetry.addData("Lift Power", "%.2f", liftPower);
            telemetry.addData("Switch Pressed", isPressed);
            telemetry.update();
        }
    }
}
```

---
