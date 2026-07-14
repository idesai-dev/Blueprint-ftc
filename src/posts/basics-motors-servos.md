---
title: Basics of Motors and Servos
panelCategory: "Basics"
date: 2026-04-15
description: Programming guide for DC motors and servos in FTC.
tags: [completed, software, beginner, completed]
author: Blueprint
published: true
---

# Basics of Motors and Servos

Almost everything your robot does physically comes down to motors and servos. Motors spin wheels and power arms. Servos position grippers and flip panels. Learning how to control them in code is the first real skill you'll build in FTC programming.

---

## DC Motors

DC motors are what you'll use for your drivetrain and for high-torque mechanisms like arms, linear slides, and intakes.

### 1. Initialization

Every hardware device on your robot gets grabbed from the `hardwareMap` at the start of your OpMode. The string you pass in has to match the name you gave the device in the robot configuration app.

```java
DcMotor leftDrive = hardwareMap.get(DcMotor.class, "leftDrive");
```

### 2. Setting Direction

Depending on which way a motor is mounted, it might spin the wrong direction for what you need. Just call `setDirection` to flip it.

```java
leftDrive.setDirection(DcMotor.Direction.REVERSE);
```

This is really common on drivetrains where the motors on one side face the opposite direction from the other side.

### 3. Basic Control

Motor power runs from -1.0 to 1.0. Positive values spin one way, negative values spin the other. Zero stops the motor.

```java
leftDrive.setPower(0.5); // 50% power forward
```

### 4. Zero Power Behavior

When you set a motor's power to zero, you can choose what happens. Brake mode actively resists any movement, which is great for precision positioning. Float mode lets the motor spin freely, which can be useful for certain intake designs.

```java
leftDrive.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
```

For most mechanisms, you'll want BRAKE. For drivetrains it's more of a preference call.

---

## Servos

Servos are used when you need precise angular positioning rather than continuous rotation. Think grippers, wrist joints, or anything that needs to move to a specific angle and hold there.

### 1. Standard Servos

Standard servos take a position value from 0.0 to 1.0, where 0.0 and 1.0 are the two ends of the servo's range of motion and 0.5 is the center.

```java
Servo gripper = hardwareMap.get(Servo.class, "gripper");
gripper.setPosition(0.5); // Move to the middle position
```

### 2. Continuous Rotation (CR) Servos

CR servos don't have a fixed range. They just spin continuously, and you control the speed and direction. They work just like a DC motor from a code perspective.

```java
CRServo intake = hardwareMap.get(CRServo.class, "intake");
intake.setPower(1.0); // Full speed forward
```

---

## Example Program: LinearOpMode

Here's a complete working example that pulls everything above together. It initializes an arm motor and a gripper servo, then lets a driver control them with a gamepad.

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.Servo;

@TeleOp(name = "Motor and Servo Example", group = "Tutorial")
public class MotorServoExample extends LinearOpMode {

    private DcMotor armMotor;
    private Servo gripper;

    @Override
    public void runOpMode() {
        // 1. Initialize hardware
        armMotor = hardwareMap.get(DcMotor.class, "armMotor");
        gripper = hardwareMap.get(Servo.class, "gripper");

        // 2. Set directions and behaviors
        armMotor.setDirection(DcMotor.Direction.FORWARD);
        armMotor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);

        telemetry.addData("Status", "Initialized");
        telemetry.update();

        // Wait for the game to start (driver presses START)
        waitForStart();

        // Run until the end of the match (driver presses STOP)
        while (opModeIsActive()) {
            
            // 3. Control Motor (e.g., using left stick Y)
            double motorPower = -gamepad1.left_stick_y; 
            armMotor.setPower(motorPower);

            // 4. Control Servo (e.g., using buttons)
            if (gamepad1.a) {
                gripper.setPosition(1.0); // Open
            } else if (gamepad1.b) {
                gripper.setPosition(0.0); // Closed
            }

            // 5. Send telemetry to the driver station
            telemetry.addData("Motor Power", motorPower);
            telemetry.addData("Servo Position", gripper.getPosition());
            telemetry.update();
        }
    }
}
```

Notice that the left stick Y axis is negated. That's because gamepad joysticks in the FTC SDK report up as a negative value, which is the opposite of what you'd expect. Negating it makes pushing the stick forward give you a positive power value.
