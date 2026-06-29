---
title: Common Practices
panelCategory: "Miscellaneous"
date: 2026-06-14
description: Good habits and patterns every FTC programmer should follow to keep code clean, safe, and competition-ready.
tags: [software, manual, beginner, completed]
author: Blueprint
published: true
---

# Common Practices

These are the habits that separate code that works in the pit from code that works on the field. None of this is magic - it's just stuff experienced teams do consistently.

## Keep OpModes Organized

All your OpModes live in the `TeamCode/src/main/java/org/firstinspires/ftc/teamcode/` folder. Use packages to group related files. For example, put autonomous programs in a `auto` sub-package and TeleOp programs in a `teleop` sub-package. This keeps things easy to find when you're scrambling at a competition.

**One OpMode per file.** It is tempting to dump two or three OpModes into one file. Don't. It gets confusing fast and makes debugging harder.

## Name Things Descriptively

Call your motors what they are. `frontLeft` tells you everything. `motor0` tells you nothing.

- Variables and fields: `camelCase` (`frontLeftMotor`, `clawServo`)
- Classes: `PascalCase` (`MecanumDrive`, `TeleOpMain`)
- Constants: `ALL_CAPS_WITH_UNDERSCORES` (`MAX_DRIVE_SPEED`, `CLAW_OPEN_POSITION`)

Good names mean you spend less time reading code and more time driving robots.

## Initialize Hardware in One Place

Put all your `hardwareMap.get()` calls together at the top of `runOpMode()`, before `waitForStart()`. This way, if something fails to initialize, you catch it before the match starts.

```java
@Override
public void runOpMode() {
    // Initialize all hardware here, at the top
    DcMotor frontLeft  = hardwareMap.get(DcMotor.class, "frontLeft");
    DcMotor frontRight = hardwareMap.get(DcMotor.class, "frontRight");
    DcMotor backLeft   = hardwareMap.get(DcMotor.class, "backLeft");
    DcMotor backRight  = hardwareMap.get(DcMotor.class, "backRight");

    Servo claw = hardwareMap.get(Servo.class, "claw");

    // Set directions explicitly - never assume
    frontLeft.setDirection(DcMotor.Direction.REVERSE);
    backLeft.setDirection(DcMotor.Direction.REVERSE);
    frontRight.setDirection(DcMotor.Direction.FORWARD);
    backRight.setDirection(DcMotor.Direction.FORWARD);

    // Set servo to a known starting position
    claw.setPosition(0.0);

    waitForStart();

    while (opModeIsActive()) {
        // main loop
    }
}
```

## Always Set Motor Directions Explicitly

Never assume a motor spins the right way out of the box. On a mecanum drivetrain, the left-side motors usually need to be reversed so the robot drives forward when all four motors get a positive power value. Set every direction yourself, every time.

## Reset Encoders at the Start of Autonomous

Stale encoder counts from the last match will throw off your autonomous. Reset them before you do anything else.

```java
frontLeft.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
frontLeft.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
```

Do this for every drive motor.

## Telemetry Best Practices

Telemetry is your best debugging friend. Use `addData()` to print values you need to see, but call `telemetry.update()` exactly once per loop - not inside conditionals, not multiple times. Calling it multiple times per loop causes flicker and can slow things down.

```java
while (opModeIsActive()) {
    double power = -gamepad1.left_stick_y;

    frontLeft.setPower(power);

    telemetry.addData("Front Left Power", frontLeft.getPower());
    telemetry.addData("Loop Time (ms)", loopTimer.milliseconds());
    telemetry.update(); // once, at the end
}
```

Before competition, clean up telemetry. Leave only what your drivers actually need to see. A wall of debug numbers is distracting.

## Use ElapsedTime Instead of Thread.sleep()

`Thread.sleep()` freezes the entire OpMode. Your gamepad stops responding, your telemetry stops updating, and the robot can't react to anything. In TeleOp especially, this is a problem. Use `ElapsedTime` to track time without blocking.

```java
ElapsedTime clawTimer = new ElapsedTime();

// Start the timer when the button is pressed
if (gamepad1.a) {
    claw.setPosition(1.0);
    clawTimer.reset();
}

// Check the timer without blocking the loop
if (clawTimer.seconds() > 0.5) {
    claw.setPosition(0.0);
}
```

The loop keeps running, the driver stays in control, and the claw still closes on schedule.

## Define Constants at the Top

Magic numbers scattered through your code are a maintenance nightmare. What does `0.73` mean? Who knows. Pull every tunable value into a named constant at the top of your class.

```java
public class TeleOpMain extends LinearOpMode {

    static final double MAX_DRIVE_SPEED    = 0.8;
    static final double CLAW_OPEN_POSITION = 0.0;
    static final double CLAW_CLOSED_POSITION = 0.9;
    static final double SLOW_MODE_MULTIPLIER = 0.4;

    @Override
    public void runOpMode() {
        // now your code reads like English
        claw.setPosition(CLAW_OPEN_POSITION);
    }
}
```

When you need to tune a value, you change it in one place instead of hunting through hundreds of lines.

## Test Incrementally

Don't write an entire autonomous and then try to run it for the first time at competition. Test each subsystem by itself first. Make sure the drivetrain works, then test the arm, then test them together. Small tests catch bugs early when they're easy to fix.
