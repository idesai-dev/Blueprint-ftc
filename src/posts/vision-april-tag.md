---
title: AprilTag Detection
panelCategory: "Vision"
date: 2026-04-14
description: Using AprilTags for localization and detection in FTC autonomous routines.
tags: [software, beginner, completed]
author: Blueprint
published: true
---

AprilTags are one of the most useful tools in FTC autonomous programming. Once you learn how to use them, your robot can figure out where it is on the field without any guesswork. That means more reliable autonomous routines, better alignment, and higher scores. Let's break down exactly how they work and how to use them in your code.

## What Are AprilTags?

An AprilTag is a small square marker with a unique black-and-white pattern inside it, kind of like a QR code. FTC places these tags on the field walls and game elements every season. Your robot's camera can spot these tags and instantly calculate useful information like how far away the tag is, what angle the robot is looking at it from, and how much the tag is rotated relative to the camera.

Think of it like a street sign. When you see a stop sign, you know exactly what it means and where you are. AprilTags work the same way for your robot. The camera sees a tag, looks up its ID, and knows exactly what that tag represents on the field.

The best part is that the FTC SDK handles all the heavy math for you. You just set up the camera, read the data, and use it in your code.

## What You Need

Before writing any code, make sure you have:

- A USB webcam plugged into one of the Control Hub's USB ports
- The webcam configured in your robot configuration file with a name like "Webcam 1"
- A recent version of the FTC SDK (2024-2025 season or later)

The modern way to use AprilTags in FTC is through the **Vision Portal**. This replaced older approaches like VuMark and TensorFlow. If you see old tutorials using those, ignore them. The Vision Portal is cleaner, faster, and officially supported.

## Setting Up the Vision Portal

To start detecting AprilTags, you need two things: an `AprilTagProcessor` and a `VisionPortal`. The processor does the actual detection work. The portal manages the camera and feeds frames to the processor.

Here is how you set both up:

```java
AprilTagProcessor aprilTagProcessor = new AprilTagProcessor.Builder().build();

VisionPortal visionPortal = new VisionPortal.Builder()
    .setCamera(hardwareMap.get(WebcamName.class, "Webcam 1"))
    .addProcessor(aprilTagProcessor)
    .build();
```

That is all it takes to get started. The `Builder` pattern lets you customize settings if you need to, but the defaults work great for FTC field tags. Make sure the string "Webcam 1" matches exactly what you named your webcam in the robot configuration.

Put this code in your `init()` method or at the start of your `runOpMode()` method. The Vision Portal will start up and begin processing camera frames right away.

## Reading Tag Detections

Once the Vision Portal is running, you can ask the processor for a list of everything it currently sees. Each detected tag comes back as an `AprilTagDetection` object with a bunch of useful fields.

```java
List<AprilTagDetection> detections = aprilTagProcessor.getDetections();
for (AprilTagDetection detection : detections) {
    if (detection.metadata != null) {
        telemetry.addLine("Tag ID " + detection.id);
        telemetry.addLine("  Range: " + detection.ftcPose.range + " inches");
        telemetry.addLine("  Bearing: " + detection.ftcPose.bearing + " degrees");
        telemetry.addLine("  Yaw: " + detection.ftcPose.yaw + " degrees");
    }
}
```

The `detection.metadata != null` check is important. If the processor sees a tag but cannot find it in its tag library, `metadata` will be null. Only known, recognized tags will have full pose information. Skipping unknown tags keeps your code clean and crash-free.

### Understanding the Pose Fields

The `ftcPose` object is where all the good data lives. Here is what each field means in plain terms:

- **`ftcPose.range`** - The straight-line distance in inches from your camera to the center of the tag. If range is 24, the tag is about two feet away.
- **`ftcPose.bearing`** - The left-right angle to the tag in degrees. A bearing of 0 means the tag is directly in front of the camera. Negative values mean the tag is to the left, and positive values mean it is to the right.
- **`ftcPose.yaw`** - How much the tag itself is rotated relative to your camera's view. This tells you if you are looking at the tag straight-on or at an angle.

For most autonomous tasks, `range` and `bearing` are the two fields you will use the most. Range tells you when to stop, and bearing tells you which way to steer.

## A Practical Autonomous Example

Here is a simple but real autonomous routine. The robot looks for a specific AprilTag, drives toward it using a mecanum drivetrain, and stops when it gets close enough. This is the kind of thing you would use to line up for scoring.

```java
@Autonomous(name = "Drive To AprilTag")
public class DriveToAprilTag extends LinearOpMode {

    static final int TARGET_TAG_ID = 3;
    static final double DESIRED_RANGE_INCHES = 12.0;
    static final double DRIVE_SPEED = 0.4;
    static final double STEER_SPEED = 0.3;

    @Override
    public void runOpMode() {

        DcMotor frontLeft  = hardwareMap.get(DcMotor.class, "frontLeft");
        DcMotor frontRight = hardwareMap.get(DcMotor.class, "frontRight");
        DcMotor backLeft   = hardwareMap.get(DcMotor.class, "backLeft");
        DcMotor backRight  = hardwareMap.get(DcMotor.class, "backRight");

        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        frontLeft.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);
        frontRight.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);
        backLeft.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);
        backRight.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);

        AprilTagProcessor aprilTagProcessor = new AprilTagProcessor.Builder().build();

        VisionPortal visionPortal = new VisionPortal.Builder()
            .setCamera(hardwareMap.get(WebcamName.class, "Webcam 1"))
            .addProcessor(aprilTagProcessor)
            .build();

        telemetry.addLine("Ready. Waiting for start...");
        telemetry.update();
        waitForStart();

        while (opModeIsActive()) {

            AprilTagDetection targetTag = null;

            List<AprilTagDetection> detections = aprilTagProcessor.getDetections();
            for (AprilTagDetection detection : detections) {
                if (detection.metadata != null && detection.id == TARGET_TAG_ID) {
                    targetTag = detection;
                    break;
                }
            }

            if (targetTag != null) {
                double rangeError   = targetTag.ftcPose.range - DESIRED_RANGE_INCHES;
                double bearingError = targetTag.ftcPose.bearing;

                // Stop if we are close enough and roughly centered
                if (Math.abs(rangeError) < 1.0 && Math.abs(bearingError) < 2.0) {
                    frontLeft.setPower(0);
                    frontRight.setPower(0);
                    backLeft.setPower(0);
                    backRight.setPower(0);
                    telemetry.addLine("On target! Stopping.");
                } else {
                    // Drive forward/backward based on range, strafe based on bearing
                    double drive  = (rangeError > 0) ? DRIVE_SPEED : -DRIVE_SPEED;
                    double strafe = (bearingError < 0) ? STEER_SPEED : -STEER_SPEED;

                    if (Math.abs(rangeError) < 2.0)   drive  = 0;
                    if (Math.abs(bearingError) < 3.0)  strafe = 0;

                    frontLeft.setPower(drive + strafe);
                    frontRight.setPower(drive - strafe);
                    backLeft.setPower(drive - strafe);
                    backRight.setPower(drive + strafe);
                }

                telemetry.addData("Range",   targetTag.ftcPose.range);
                telemetry.addData("Bearing", targetTag.ftcPose.bearing);

            } else {
                // Tag not visible - stop and wait
                frontLeft.setPower(0);
                frontRight.setPower(0);
                backLeft.setPower(0);
                backRight.setPower(0);
                telemetry.addLine("Tag not found. Waiting...");
            }

            telemetry.update();
        }

        visionPortal.close();
    }
}
```

Walk through what this code does step by step. First, it sets up four mecanum motors and puts them in `RUN_WITHOUT_ENCODER` mode. Then it builds the Vision Portal with an AprilTag processor. After start is pressed, the loop keeps looking for tag ID 3. When it finds the tag, it calculates how far off the robot is in both range and bearing, and adjusts the motor powers accordingly. When both errors are small enough, the robot stops. If the tag disappears from view, the robot stops and waits.

This is a simplified example. A real competition routine would use proportional control - where motor power scales smoothly with the error instead of snapping on and off - and would add a timeout so the robot does not wait forever. But this gives you the solid structure to build from.

## Tips for Success

**Close the Vision Portal when you are done.** Calling `visionPortal.close()` at the end of your OpMode frees up the camera and memory. If you skip this, you may run into issues when re-initializing the camera on your next run.

**Use streaming to see what your camera sees.** During testing, call `visionPortal.resumeStreaming()` and open the camera stream on your Driver Hub or phone. This is incredibly helpful for diagnosing detection problems. You can literally see whether your camera has a clear line of sight to the tags.

**Lighting matters more than you think.** AprilTag detection works much better in consistent, bright lighting. A tag that your robot can see perfectly in your school hallway might be invisible under the weird gym lighting at a competition. Always test in lighting conditions that are as close to competition as possible.

**Do not change the tag size unless you are using custom-printed tags.** The FTC SDK already knows the physical size of the official field tags. If you set a custom tag size in the builder, you will throw off all the range calculations. Only change this if you are testing with your own printed tags at a different size.

**Always check `metadata` before reading pose data.** This is the most common source of null pointer crashes in vision code. The check `detection.metadata != null` is short, but it will save you a lot of headaches at competition.

AprilTags are genuinely one of the best tools available to FTC teams. Once you get comfortable reading their data, you can build autonomous routines that are much more adaptable and reliable than ones that rely purely on timing or encoder counts. Give this a try in your next auto and see how much more consistent your robot becomes.
