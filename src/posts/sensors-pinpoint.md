---
title: Pinpoint Odometry Computer
panelCategory: "Sensors"
date: 2026-05-20
description: How to use the pinpoint odometry computer in FTC
published: true
tags: [software, completed]
author: Blueprint
---

The goBILDA Pinpoint Odometry Computer is a small I2C device that gives your robot a very accurate sense of where it is on the field. Instead of guessing position from motor encoders (which slip and drift), the Pinpoint reads from two dedicated deadwheel pods, one for forward/back motion and one for left/right motion. It combines those readings and gives you X position, Y position, and heading all in one place.

## Why Use It?

Motor encoders are fine for straight-line driving, but they lose accuracy fast when the robot strafes or turns. Deadwheels roll freely on the ground and don't slip like powered wheels do. The Pinpoint fuses both encoder readings so your robot always knows where it is, even after a bunch of turns. This makes autonomous routines way more reliable.

## Wiring

Plug the Pinpoint into any I2C port on the Control Hub using the included cable. Then connect each deadwheel pod's encoder cable to the Pinpoint's encoder inputs. One pod goes in the forward/back direction (usually under the robot, pointing along the length), and the other goes side to side (pointing along the width). The pods themselves mount through holes in the drivetrain frame or on standoffs so the wheels drag on the ground at all times.

Name the device `"pinpoint"` in the Robot Configuration on the Driver Hub.

## Java Setup

Add these imports to your OpMode:

```java
import com.qualcomm.hardware.gobilda.GoBildaPinpointDriver;
import org.firstinspires.ftc.robotcore.external.navigation.Pose2D;
import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;
import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
```

Then declare and initialize the driver:

```java
GoBildaPinpointDriver pinpoint;

@Override
public void init() {
    pinpoint = hardwareMap.get(GoBildaPinpointDriver.class, "pinpoint");

    // Set which direction each encoder counts positive
    pinpoint.setEncoderDirections(
        GoBildaPinpointDriver.EncoderDirection.FORWARD,
        GoBildaPinpointDriver.EncoderDirection.FORWARD
    );

    // Tell the Pinpoint what pod type you're using
    pinpoint.setEncoderResolution(GoBildaPinpointDriver.GoBildaOdometryPods.goBILDA_4_BAR_POD);

    // Set the pod offsets from the robot's center (in millimeters)
    pinpoint.setOffsets(-84.0, -168.0);

    // Reset position and IMU heading to zero
    pinpoint.resetPosAndIMU();
}
```

## Pod Offsets

The offsets tell the Pinpoint how far each pod is from the robot's center of rotation. Measure this in millimeters. The X offset is how far the side-to-side pod sits forward or back from center, and the Y offset is how far the forward/back pod sits left or right from center. Getting these right matters. Bad offsets cause your heading to drift when you spin in place.

## Reading Position

Call `pinpoint.update()` every loop cycle, then grab the position:

```java
@Override
public void loop() {
    pinpoint.update();

    Pose2D pos = pinpoint.getPosition();

    double x = pos.getX(DistanceUnit.MM);
    double y = pos.getY(DistanceUnit.MM);
    double heading = pos.getHeading(AngleUnit.DEGREES);

    telemetry.addData("X (mm)", x);
    telemetry.addData("Y (mm)", y);
    telemetry.addData("Heading (deg)", heading);
    telemetry.update();
}
```

That's a complete TeleOp you can use to test the odometry. Drive the robot around and watch the numbers update in real time. If the signs are wrong (X goes negative when you drive forward), flip the encoder direction for that pod.

## Resetting at Autonomous Start

Always call `pinpoint.resetPosAndIMU()` in `init()` so the robot starts at (0, 0) with 0 degrees heading. If you skip this, the position carries over from the last run and your autonomous will drive to the wrong place.

## Using It for Closed-Loop Autonomous

Once you know where the robot is, you can drive to a target position by comparing current position to where you want to be:

```java
// Drive forward until X reaches 600mm
while (opModeIsActive()) {
    pinpoint.update();
    Pose2D pos = pinpoint.getPosition();

    double error = 600.0 - pos.getX(DistanceUnit.MM);

    if (Math.abs(error) < 10.0) break; // close enough

    double power = error * 0.003; // simple proportional control
    drive.setMotorPowers(power, power, power, power);
}
drive.setMotorPowers(0, 0, 0, 0);
```

This is the foundation of any decent autonomous routine. You can extend the same idea to Y position and heading to navigate anywhere on the field. Pair it with a full road-runner or custom PID controller for even smoother movement.
