---
title: Universal IMU Guide
panelCategory: "Sensors"
date: 2026-05-14
description: Using the modern, hub-agnostic IMU interface for robot orientation.
tags: [software, completed, beginner]
author: Ishaan Desai
published: true
---

The IMU (Inertial Measurement Unit) is one of the most useful sensors built into the REV Control Hub. It combines a gyroscope (which tracks rotation) and an accelerometer (which tracks acceleration) to give your robot a sense of where it is pointing in 3D space. The most common use in FTC is reading the yaw angle, which tells you which direction your robot is facing.

Since SDK 8.0, FTC uses a universal `IMU` interface that works across all REV hub versions. If you have seen older code using `BNO055IMU`, that is the old way. This guide covers the modern approach.

---

## Defining Hub Orientation

Before the IMU can give you correct angles, you need to tell it how the Control Hub is physically mounted on your robot. The software needs to know this so it can rotate the sensor readings to match your robot's frame.

You do this with `RevHubOrientationOnRobot`. You specify two things: which direction the REV logo on the hub is facing, and which direction the USB ports are facing.

```java
import com.qualcomm.hardware.rev.RevHubOrientationOnRobot;
import com.qualcomm.robotcore.hardware.IMU;

IMU imu = hardwareMap.get(IMU.class, "imu");

// Adjust these to match your robot's actual mounting!
IMU.Parameters parameters = new IMU.Parameters(new RevHubOrientationOnRobot(
    RevHubOrientationOnRobot.LogoFacingDirection.UP,
    RevHubOrientationOnRobot.UsbFacingDirection.FORWARD
));

imu.initialize(parameters);
```

If you get weird or flipped angle readings during testing, the orientation is probably set wrong. Double-check which direction the logo and USB ports are actually pointing on your robot.

## Reading Yaw, Pitch, and Roll

The IMU gives you three angles. Yaw is the one you will use most often since it tells you which direction the robot is facing (the heading). Pitch is the front-to-back tilt, and roll is the side-to-side tilt.

```java
import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
import org.firstinspires.ftc.robotcore.external.navigation.YawPitchRollAngles;

YawPitchRollAngles angles = imu.getRobotYawPitchRollAngles();

double yaw   = angles.getYaw(AngleUnit.DEGREES);
double pitch = angles.getPitch(AngleUnit.DEGREES);
double roll  = angles.getRoll(AngleUnit.DEGREES);

telemetry.addData("Yaw (Heading)", "%.2f", yaw);
```

## Resetting the Heading

When your OpMode starts, yaw is automatically set to 0 based on the robot's starting position. If you want to re-zero the heading mid-match (useful in field-centric drive), just call:

```java
imu.resetYaw();
```

---

> [!CAUTION]
> Initialize the IMU before `waitForStart()`, and make sure the robot is sitting still while it initializes. Moving the robot during IMU initialization can cause drift or incorrect readings that persist throughout your match.

---

Here is a full example that initializes the IMU and reads the yaw heading each loop. Press A on the gamepad to reset the yaw to zero.

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.hardware.rev.RevHubOrientationOnRobot;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.IMU;
import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;

@TeleOp(name = "Universal IMU Example", group = "Sensor")
public class IMUExample extends LinearOpMode {

    private IMU imu;

    @Override
    public void runOpMode() {
        // 1. Initialize IMU
        imu = hardwareMap.get(IMU.class, "imu");

        // 2. Configure orientation -- change these to match your hub's mounting!
        IMU.Parameters parameters = new IMU.Parameters(new RevHubOrientationOnRobot(
                RevHubOrientationOnRobot.LogoFacingDirection.UP,
                RevHubOrientationOnRobot.UsbFacingDirection.FORWARD
        ));

        imu.initialize(parameters);

        telemetry.addData("Status", "Initialized");
        telemetry.update();

        waitForStart();

        while (opModeIsActive()) {
            // 3. Reset yaw if 'A' is pressed
            if (gamepad1.a) {
                imu.resetYaw();
            }

            // 4. Read heading
            double yaw = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.DEGREES);

            telemetry.addData("Heading", "%.2f degrees", yaw);
            telemetry.addData("Tip", "Press 'A' to reset Yaw");
            telemetry.update();
        }
    }
}
```
