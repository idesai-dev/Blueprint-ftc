---
title: Drivetrain Functions
panelCategory: "Encoder Based"
date: 2026-06-10
description: Essential drivetrain functions for autonomous control using encoders.
tags: [software, auto, intermediate, completed]
author: Blueprint
published: true
---

# Drivetrain Functions

Once you understand the basics of encoder-based movement, the next step is organizing your code so you are not rewriting the same motor setup over and over. The solution is helper functions. Instead of copying six lines of encoder code every time you want to drive forward, you call one method: `driveForward(24, 0.5)`. Clean, readable, and much easier to debug.

This guide walks through how to build a complete set of drivetrain functions for a mecanum robot.

---

## Setting Up ZeroPowerBehavior

Before writing any movement functions, add this to your initialization. Setting motors to `BRAKE` mode means they actively resist movement when power is cut, instead of coasting to a stop. For autonomous, this gives you more precise stopping.

```java
frontLeft.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
frontRight.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
backLeft.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
backRight.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
```

---

## Ticks Per Inch: Calibrate Your Own Value

Every drivetrain is a little different. Ticks per inch depends on three things: the motor's encoder resolution, the gear ratio, and the wheel diameter. A rough starting estimate for goBILDA 312 RPM motors with 96mm mecanum wheels is about 45 to 48 ticks per inch.

That estimate gets you close, but you should calibrate the real value for your robot. Here is how:

1. Mark a start position on the floor.
2. Command the robot to drive exactly 48 inches using your current `TICKS_PER_INCH` value.
3. Measure how far it actually traveled.
4. Adjust the value using this formula: `new value = (48 / actual inches) * current TICKS_PER_INCH`
5. Repeat until the robot consistently hits 48 inches.

Put this constant near the top of your OpMode class:

```java
// Calibrate this value for your specific robot!
static final double TICKS_PER_INCH = 45.0;
```

---

## The Helper Utility Methods

Every drivetrain function uses two private helper methods to set the mode and power of all four motors at once. Define these once and call them everywhere.

```java
private void setAllRunMode(DcMotor.RunMode mode) {
    frontLeft.setMode(mode);
    frontRight.setMode(mode);
    backLeft.setMode(mode);
    backRight.setMode(mode);
}

private void setAllPower(double power) {
    frontLeft.setPower(power);
    frontRight.setPower(power);
    backLeft.setPower(power);
    backRight.setPower(power);
}
```

---

## driveForward

For a mecanum drivetrain, driving forward means all four motors spin in the same direction. Passing a negative `inches` value drives backward.

```java
public void driveForward(double inches, double power) {
    int ticks = (int)(inches * TICKS_PER_INCH);

    frontLeft.setTargetPosition(frontLeft.getCurrentPosition() + ticks);
    frontRight.setTargetPosition(frontRight.getCurrentPosition() + ticks);
    backLeft.setTargetPosition(backLeft.getCurrentPosition() + ticks);
    backRight.setTargetPosition(backRight.getCurrentPosition() + ticks);

    setAllRunMode(DcMotor.RunMode.RUN_TO_POSITION);
    setAllPower(power);

    while (opModeIsActive() && (frontLeft.isBusy() && frontRight.isBusy())) {
        telemetry.addData("Driving forward", "%.1f inches", inches);
        telemetry.update();
    }

    setAllPower(0);
    setAllRunMode(DcMotor.RunMode.RUN_USING_ENCODER);
}
```

Notice the use of `getCurrentPosition() + ticks` rather than just `ticks`. This makes the target relative to wherever the motor currently is, which is important because encoder counts accumulate across multiple movements in the same run.

---

## strafeRight

Strafing on a mecanum drivetrain works by running diagonal pairs of wheels in opposite directions. For strafing right, the front-left and back-right motors go forward, while the front-right and back-left motors go backward.

Strafing with encoders is less accurate than forward and backward movement. The mecanum rollers slip sideways under load, so the same number of ticks covers slightly different distances depending on floor surface and robot weight. A correction factor of about 1.1 helps compensate, but you should still calibrate this for your robot. For high-precision strafing, consider a dedicated odometry wheel instead.

```java
public void strafeRight(double inches, double power) {
    int ticks = (int)(inches * TICKS_PER_INCH * 1.1); // strafe correction factor

    frontLeft.setTargetPosition(frontLeft.getCurrentPosition() + ticks);
    frontRight.setTargetPosition(frontRight.getCurrentPosition() - ticks);
    backLeft.setTargetPosition(backLeft.getCurrentPosition() - ticks);
    backRight.setTargetPosition(backRight.getCurrentPosition() + ticks);

    setAllRunMode(DcMotor.RunMode.RUN_TO_POSITION);
    setAllPower(power);

    while (opModeIsActive() && (frontLeft.isBusy() && frontRight.isBusy())) {
        telemetry.addData("Strafing right", "%.1f inches", inches);
        telemetry.update();
    }

    setAllPower(0);
    setAllRunMode(DcMotor.RunMode.RUN_USING_ENCODER);
}
```

To strafe left, pass a negative `inches` value.

---

## turnRight (and Why the IMU Is Better)

Turning with encoders works by running the left-side motors forward and the right-side motors backward. However, turning by encoder ticks is less reliable than the other movements. The turning radius changes based on how the robot is loaded, and there is no way to correct for drift mid-turn without additional sensors.

For turning, the IMU (the built-in gyroscope in your Control Hub) gives you far more accurate results. It measures actual rotation angle instead of guessing from wheel ticks. A dedicated IMU turning guide covers that method in depth.

That said, here is a simple encoder-based turn if you need a quick starting point:

```java
// Rough ticks-per-degree for a mecanum robot. Calibrate this for your robot!
static final double TICKS_PER_DEGREE = 5.7;

public void turnRight(double degrees, double power) {
    int ticks = (int)(degrees * TICKS_PER_DEGREE);

    frontLeft.setTargetPosition(frontLeft.getCurrentPosition() + ticks);
    frontRight.setTargetPosition(frontRight.getCurrentPosition() - ticks);
    backLeft.setTargetPosition(backLeft.getCurrentPosition() + ticks);
    backRight.setTargetPosition(backRight.getCurrentPosition() - ticks);

    setAllRunMode(DcMotor.RunMode.RUN_TO_POSITION);
    setAllPower(power);

    while (opModeIsActive() && (frontLeft.isBusy() || frontRight.isBusy())) {
        telemetry.addData("Turning right", "%.1f degrees", degrees);
        telemetry.update();
    }

    setAllPower(0);
    setAllRunMode(DcMotor.RunMode.RUN_USING_ENCODER);
}
```

The `TICKS_PER_DEGREE` value varies a lot between robots. Measure it by commanding a 90-degree turn and seeing how far the robot actually rotates, then adjust. For critical turns in competition, use the IMU instead.

---

## Full Example OpMode

Here is everything put together in a complete autonomous OpMode. This routine drives forward, strafes right, and turns before driving forward once more.

```java
@Autonomous(name = "Encoder Drivetrain Auto")
public class EncoderDrivetrainAuto extends LinearOpMode {

    DcMotor frontLeft, frontRight, backLeft, backRight;

    static final double TICKS_PER_INCH   = 45.0;  // calibrate this!
    static final double TICKS_PER_DEGREE = 5.7;   // calibrate this!

    @Override
    public void runOpMode() {
        frontLeft  = hardwareMap.get(DcMotor.class, "frontLeft");
        frontRight = hardwareMap.get(DcMotor.class, "frontRight");
        backLeft   = hardwareMap.get(DcMotor.class, "backLeft");
        backRight  = hardwareMap.get(DcMotor.class, "backRight");

        // Reverse left side motors (adjust for your wiring)
        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        // Brake mode for more precise stopping
        frontLeft.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        frontRight.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        backLeft.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        backRight.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);

        // Reset encoders
        setAllRunMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        setAllRunMode(DcMotor.RunMode.RUN_USING_ENCODER);

        telemetry.addData("Status", "Ready");
        telemetry.update();

        waitForStart();

        // Run the autonomous routine
        driveForward(24, 0.5);  // drive forward 24 inches
        strafeRight(12, 0.4);  // strafe right 12 inches
        turnRight(90, 0.4);    // turn right 90 degrees (consider IMU for better accuracy)
        driveForward(12, 0.5); // drive forward another 12 inches
    }

    public void driveForward(double inches, double power) {
        int ticks = (int)(inches * TICKS_PER_INCH);

        frontLeft.setTargetPosition(frontLeft.getCurrentPosition() + ticks);
        frontRight.setTargetPosition(frontRight.getCurrentPosition() + ticks);
        backLeft.setTargetPosition(backLeft.getCurrentPosition() + ticks);
        backRight.setTargetPosition(backRight.getCurrentPosition() + ticks);

        setAllRunMode(DcMotor.RunMode.RUN_TO_POSITION);
        setAllPower(power);

        while (opModeIsActive() && (frontLeft.isBusy() && frontRight.isBusy())) {
            telemetry.addData("Driving forward", "%.1f inches", inches);
            telemetry.update();
        }

        setAllPower(0);
        setAllRunMode(DcMotor.RunMode.RUN_USING_ENCODER);
    }

    public void strafeRight(double inches, double power) {
        int ticks = (int)(inches * TICKS_PER_INCH * 1.1);

        frontLeft.setTargetPosition(frontLeft.getCurrentPosition() + ticks);
        frontRight.setTargetPosition(frontRight.getCurrentPosition() - ticks);
        backLeft.setTargetPosition(backLeft.getCurrentPosition() - ticks);
        backRight.setTargetPosition(backRight.getCurrentPosition() + ticks);

        setAllRunMode(DcMotor.RunMode.RUN_TO_POSITION);
        setAllPower(power);

        while (opModeIsActive() && (frontLeft.isBusy() && frontRight.isBusy())) {
            telemetry.addData("Strafing right", "%.1f inches", inches);
            telemetry.update();
        }

        setAllPower(0);
        setAllRunMode(DcMotor.RunMode.RUN_USING_ENCODER);
    }

    public void turnRight(double degrees, double power) {
        int ticks = (int)(degrees * TICKS_PER_DEGREE);

        frontLeft.setTargetPosition(frontLeft.getCurrentPosition() + ticks);
        frontRight.setTargetPosition(frontRight.getCurrentPosition() - ticks);
        backLeft.setTargetPosition(backLeft.getCurrentPosition() + ticks);
        backRight.setTargetPosition(backRight.getCurrentPosition() - ticks);

        setAllRunMode(DcMotor.RunMode.RUN_TO_POSITION);
        setAllPower(power);

        while (opModeIsActive() && (frontLeft.isBusy() || frontRight.isBusy())) {
            telemetry.addData("Turning right", "%.1f degrees", degrees);
            telemetry.update();
        }

        setAllPower(0);
        setAllRunMode(DcMotor.RunMode.RUN_USING_ENCODER);
    }

    private void setAllRunMode(DcMotor.RunMode mode) {
        frontLeft.setMode(mode);
        frontRight.setMode(mode);
        backLeft.setMode(mode);
        backRight.setMode(mode);
    }

    private void setAllPower(double power) {
        frontLeft.setPower(power);
        frontRight.setPower(power);
        backLeft.setPower(power);
        backRight.setPower(power);
    }
}
```

---

## Key Takeaways

- Always calibrate `TICKS_PER_INCH` on your actual robot. The default value is just a starting point.
- Use `getCurrentPosition() + ticks` so movement targets are relative, not absolute.
- Strafing accuracy is lower than forward and backward movement. Calibrate the correction factor separately and expect it to vary by surface.
- For turning, the IMU gives more reliable results than encoder counts. Use encoder turns only as a fallback.
- The next guide covers subsystem functions, so you can control arms, claws, and slides with the same clean helper-function pattern.
