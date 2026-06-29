---
title: Subsystem Functions
panelCategory: "Encoder Based"
date: 2026-06-12
description: Designing subsystem functions for autonomous routines using encoders and servos.
tags: [software, auto, intermediate, completed]
author: Blueprint
published: true
---

# Subsystem Functions

Your drivetrain is not the only thing moving during autonomous. Your arm needs to lift to a scoring position. Your claw needs to open and close at the right moment. Your linear slide needs to extend to a specific height. These mechanisms are called **subsystems**, and they deserve the same clean helper-function treatment as your drivetrain.

Writing subsystem functions makes your autonomous code dramatically easier to read and reuse. Instead of embedding motor control logic inside your `runOpMode` method, you call `moveArmToPosition(800, 0.7)` and move on. Each function handles its own setup, waiting, and cleanup.

---

## What Counts as a Subsystem?

A subsystem is any mechanism on your robot that has its own motor or servo. Common examples include:

- **Arm:** a rotating joint powered by a DC motor
- **Linear slide:** a telescoping mechanism driven by a DC motor
- **Claw or gripper:** typically controlled by one or two servos
- **Intake:** a spinning roller or set of rollers

Each of these can be wrapped in its own set of functions. The patterns below apply to almost any motor-driven or servo-driven mechanism.

---

## Motor Subsystems: RUN_TO_POSITION

For mechanisms like arms and linear slides, `RUN_TO_POSITION` mode works exactly like it does for your drivetrain. You give it a target tick count, set a power level, and the motor drives until it reaches that position.

One important addition for subsystems is a **timeout**. Sometimes `isBusy()` can stay true longer than expected. This happens if the mechanism is physically blocked or stalling against something. An `ElapsedTime` timeout protects against your autonomous getting stuck and burning up the rest of your 30 seconds waiting on a single movement.

```java
public void moveArmToPosition(int targetTicks, double power) {
    armMotor.setTargetPosition(targetTicks);
    armMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
    armMotor.setPower(Math.abs(power));

    ElapsedTime timeout = new ElapsedTime();
    while (opModeIsActive() && armMotor.isBusy() && timeout.seconds() < 3.0) {
        telemetry.addData("Arm", "Moving to position %d", targetTicks);
        telemetry.addData("Current", armMotor.getCurrentPosition());
        telemetry.update();
    }

    armMotor.setPower(0);
}
```

A few things worth noting here. The `Math.abs(power)` call ensures power is always positive, since `RUN_TO_POSITION` handles direction automatically based on whether the target is above or below the current position. The 3.0-second timeout is a reasonable default, but adjust it based on how long your mechanism actually takes to move.

---

## Defining Arm Positions as Constants

Hard-coding tick values everywhere in your `runOpMode` is messy and hard to tune. Instead, define named constants at the top of your class:

```java
static final int ARM_HOME       = 0;
static final int ARM_PICKUP     = 150;
static final int ARM_SCORE_LOW  = 600;
static final int ARM_SCORE_HIGH = 1100;
```

Now your autonomous reads like a script:

```java
moveArmToPosition(ARM_SCORE_HIGH, 0.7);
// ... drop game element ...
moveArmToPosition(ARM_HOME, 0.5);
```

This is much easier to tune. If the arm is slightly off at the high scoring position, you change one constant instead of hunting through your code.

---

## Servo Subsystems: Claw Functions

Servos do not have encoders in the traditional sense. You control them by setting a position value between 0.0 and 1.0. Because servos move on their own time, you need to add a short `sleep()` call after commanding a position so the servo has time to reach its target before the rest of your code continues.

```java
static final double CLAW_OPEN   = 0.8;
static final double CLAW_CLOSED = 0.2;

public void openClaw() {
    clawServo.setPosition(CLAW_OPEN);
    sleep(500); // give the servo time to move
}

public void closeClaw() {
    clawServo.setPosition(CLAW_CLOSED);
    sleep(500);
}
```

The 500-millisecond sleep is a good starting point. If your servo is slow or the load on it is heavy, increase this value. If it is a fast servo with a light load, you might get away with 300ms. Test it on the actual robot and confirm the claw fully opens and closes before the next action runs.

---

## Linear Slide Functions

A linear slide function follows exactly the same pattern as the arm, just with different constants for your specific slide mechanism. One difference worth noting: for vertical slides, cutting power to exactly 0 after reaching the target can cause the slide to drop slightly under gravity. Setting a small holding power keeps the motor engaged.

```java
static final int SLIDE_DOWN = 0;
static final int SLIDE_LOW  = 400;
static final int SLIDE_HIGH = 1200;

public void setSlideHeight(int targetTicks, double power) {
    slideMotor.setTargetPosition(targetTicks);
    slideMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
    slideMotor.setPower(Math.abs(power));

    ElapsedTime timeout = new ElapsedTime();
    while (opModeIsActive() && slideMotor.isBusy() && timeout.seconds() < 4.0) {
        telemetry.addData("Slide", "Moving to %d ticks", targetTicks);
        telemetry.addData("Current", slideMotor.getCurrentPosition());
        telemetry.update();
    }

    // Small holding power prevents gravity from pulling the slide down
    slideMotor.setPower(0.05);
}
```

The right holding power value depends on the weight of your slide and any game elements it is carrying. Start at 0.05 and adjust from there.

---

## Putting It All Together

Here is a complete autonomous routine that uses both drivetrain and subsystem functions. This example drives to a scoring position, raises a slide, moves an arm, drops a game element, and returns home.

```java
@Autonomous(name = "Full Auto With Subsystems")
public class FullAutoWithSubsystems extends LinearOpMode {

    DcMotor frontLeft, frontRight, backLeft, backRight;
    DcMotor armMotor, slideMotor;
    Servo   clawServo;

    static final double TICKS_PER_INCH = 45.0;

    static final int ARM_HOME       = 0;
    static final int ARM_SCORE      = 700;
    static final int SLIDE_DOWN     = 0;
    static final int SLIDE_HIGH     = 1200;
    static final double CLAW_OPEN   = 0.8;
    static final double CLAW_CLOSED = 0.2;

    @Override
    public void runOpMode() {
        // Initialize drivetrain motors
        frontLeft  = hardwareMap.get(DcMotor.class, "frontLeft");
        frontRight = hardwareMap.get(DcMotor.class, "frontRight");
        backLeft   = hardwareMap.get(DcMotor.class, "backLeft");
        backRight  = hardwareMap.get(DcMotor.class, "backRight");

        // Initialize subsystem hardware
        armMotor   = hardwareMap.get(DcMotor.class, "armMotor");
        slideMotor = hardwareMap.get(DcMotor.class, "slideMotor");
        clawServo  = hardwareMap.get(Servo.class, "clawServo");

        // Motor directions (adjust for your wiring)
        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        // Brake mode on drivetrain
        frontLeft.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        frontRight.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        backLeft.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        backRight.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);

        // Reset all encoders
        setAllRunMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        armMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        slideMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);

        setAllRunMode(DcMotor.RunMode.RUN_USING_ENCODER);
        armMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        slideMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);

        // Start with claw closed (holding a game element)
        clawServo.setPosition(CLAW_CLOSED);

        telemetry.addData("Status", "Ready");
        telemetry.update();

        waitForStart();

        // Step 1: Drive to scoring position
        driveForward(36, 0.5);

        // Step 2: Raise the slide to high position
        setSlideHeight(SLIDE_HIGH, 0.8);

        // Step 3: Move the arm to scoring angle
        moveArmToPosition(ARM_SCORE, 0.6);

        // Step 4: Drop the game element
        openClaw();

        // Step 5: Return everything to home position
        moveArmToPosition(ARM_HOME, 0.5);
        setSlideHeight(SLIDE_DOWN, 0.6);

        // Step 6: Back away
        driveForward(-12, 0.4);
    }

    // --- Drivetrain Functions ---

    public void driveForward(double inches, double power) {
        int ticks = (int)(inches * TICKS_PER_INCH);

        frontLeft.setTargetPosition(frontLeft.getCurrentPosition() + ticks);
        frontRight.setTargetPosition(frontRight.getCurrentPosition() + ticks);
        backLeft.setTargetPosition(backLeft.getCurrentPosition() + ticks);
        backRight.setTargetPosition(backRight.getCurrentPosition() + ticks);

        setAllRunMode(DcMotor.RunMode.RUN_TO_POSITION);
        setAllPower(power);

        while (opModeIsActive() && (frontLeft.isBusy() && frontRight.isBusy())) {
            telemetry.addData("Driving", "%.1f inches", inches);
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

    // --- Subsystem Functions ---

    public void moveArmToPosition(int targetTicks, double power) {
        armMotor.setTargetPosition(targetTicks);
        armMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        armMotor.setPower(Math.abs(power));

        ElapsedTime timeout = new ElapsedTime();
        while (opModeIsActive() && armMotor.isBusy() && timeout.seconds() < 3.0) {
            telemetry.addData("Arm", "Moving to position %d", targetTicks);
            telemetry.addData("Current", armMotor.getCurrentPosition());
            telemetry.update();
        }

        armMotor.setPower(0);
    }

    public void setSlideHeight(int targetTicks, double power) {
        slideMotor.setTargetPosition(targetTicks);
        slideMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        slideMotor.setPower(Math.abs(power));

        ElapsedTime timeout = new ElapsedTime();
        while (opModeIsActive() && slideMotor.isBusy() && timeout.seconds() < 4.0) {
            telemetry.addData("Slide", "Moving to %d ticks", targetTicks);
            telemetry.addData("Current", slideMotor.getCurrentPosition());
            telemetry.update();
        }

        slideMotor.setPower(0.05); // small holding power against gravity
    }

    public void openClaw() {
        clawServo.setPosition(CLAW_OPEN);
        sleep(500);
    }

    public void closeClaw() {
        clawServo.setPosition(CLAW_CLOSED);
        sleep(500);
    }
}
```

---

## Tips for Robust Subsystem Functions

A few things that will save you headaches at competition:

**Always use timeouts.** If a motor stalls or a mechanism gets jammed, `isBusy()` may never return false. A timeout ensures your autonomous keeps moving even if one step fails.

**Reset subsystem encoders at init.** Just like your drivetrain, subsystem motors should start from a known encoder position. Reset them during initialization and make sure the physical mechanism is at its home position before you reset.

**Name your position constants clearly.** `ARM_SCORE_HIGH` is infinitely better than a magic number sitting somewhere in your code. Constants make tuning fast and make bugs obvious.

**Test each function independently first.** Before running your full autonomous, write a short test OpMode that only calls one function. Confirm the arm reaches the right position, then add the next piece. Debugging one thing at a time is always faster than debugging everything at once.
