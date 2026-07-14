---
title: Distance Sensor
panelCategory: "Sensors"
date: 2026-05-10
description: How to use a distance sensor
tags: [software, completed, beginner]
author: Blueprint
published: true
---

The REV 2m Distance Sensor uses time-of-flight (TOF) technology. It fires a tiny infrared pulse and measures how long it takes to bounce back. The result is a very accurate distance reading, often within a few millimeters, up to about 2 meters away. Compared to old ultrasonic sensors, TOF sensors are faster and much less prone to interference.

---

## Setting It Up

You need the `DistanceSensor` class and the `DistanceUnit` utility to request readings in whatever unit you prefer.

```java
import com.qualcomm.robotcore.hardware.DistanceSensor;
import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;

DistanceSensor distanceSensor = hardwareMap.get(DistanceSensor.class, "distanceSensor");
```

## Reading Distance

You can get the distance in inches, centimeters, or millimeters by passing the unit you want into `getDistance()`.

```java
double distanceInches = distanceSensor.getDistance(DistanceUnit.INCH);
double distanceCM = distanceSensor.getDistance(DistanceUnit.CM);

telemetry.addData("Distance (in)", "%.2f", distanceInches);
telemetry.update();
```

## What Can You Actually Use It For?

Distance sensors are more versatile than people think. Here are a few practical uses:

- **Wall alignment:** Mount one sensor on each side of your robot's front. If both read the same distance, you are squared up to the wall. If they differ, you are crooked.
- **Intake detection:** Put a sensor inside your intake. When a game piece gets close, stop the intake motor automatically.
- **Auto navigation:** Detect if another robot or obstacle is blocking your path during autonomous.
- **Automatic braking:** If your robot is driving toward a wall at full speed, cut power automatically when the sensor reads below a threshold.

> [!NOTE]
> If you use multiple TOF sensors aimed in the same direction, their infrared beams can interfere with each other and cause jittery readings. Try angling them slightly away from each other, or read them one at a time in sequence if you run into that problem.

---

Here is a complete example that implements auto-braking. The robot reads joystick input normally, but if the sensor detects something within 5 inches, forward movement is blocked.

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DistanceSensor;
import com.qualcomm.robotcore.hardware.DcMotor;
import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;

@TeleOp(name = "Auto-Brake Distance Example", group = "Sensor")
public class DistanceSensorExample extends LinearOpMode {

    private DistanceSensor distanceSensor;
    private DcMotor driveMotor;

    @Override
    public void runOpMode() {
        distanceSensor = hardwareMap.get(DistanceSensor.class, "distanceSensor");
        driveMotor = hardwareMap.get(DcMotor.class, "driveMotor");

        telemetry.addData("Status", "Initialized");
        telemetry.update();

        waitForStart();

        while (opModeIsActive()) {
            // 1. Read distance in inches
            double distanceInches = distanceSensor.getDistance(DistanceUnit.INCH);

            // 2. Drive logic with safety check
            double drivePower = -gamepad1.left_stick_y;
            
            // If we are closer than 5 inches, block forward movement
            if (distanceInches < 5.0 && drivePower > 0) {
                driveMotor.setPower(0);
                telemetry.addData("Safety", "WALL DETECTED - BRAKING");
            } else {
                driveMotor.setPower(drivePower);
                telemetry.addData("Safety", "Clear");
            }

            // 3. Telemetry output
            telemetry.addData("Distance", "%.2f in", distanceInches);
            telemetry.update();
        }
    }
}
```

---

> **Material Matters:** TOF sensors can struggle with very dark materials (which absorb the IR light) or highly reflective or transparent materials like plexiglass. Always test the sensor against the actual surface you plan to detect during build and tuning.
