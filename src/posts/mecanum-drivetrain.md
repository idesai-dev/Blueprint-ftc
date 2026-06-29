---
title: Mecanum Drivetrain
panelCategory: 'Miscellaneous'
date: 2026-04-28
description: Learn the kinematics and programming behind a 4-motor mecanum drivetrain.
tags: [completed, software, beginner, kinematics]
author: Blueprint
published: true
---

# Mecanum Drivetrain

Mecanum wheels are one of the most popular drivetrain choices in FTC, and for good reason. They let your robot move in any direction without rotating first. You can drive sideways, diagonally, or spin in place, all with four wheels that never need to turn. This works because each wheel has small rubber rollers mounted at 45-degree angles around the rim. When you spin combinations of wheels in different directions, those rollers push the robot in directions that a regular wheel never could.

---

## Kinematics: The Math Behind the Movement

To make a mecanum drivetrain work, you need to calculate the right power for each of the four motors based on what direction you want to move. You're combining three inputs: forward/backward ($y$), sideways strafing ($x$), and rotation ($r$).

The formulas for each wheel are:

- **Front Left** = $y + x + r$
- **Front Right** = $y - x - r$
- **Back Left** = $y - x + r$
- **Back Right** = $y + x - r$

This might look arbitrary at first, but it makes sense once you think about the geometry. When you strafe right, the front-left and back-right wheels need to push forward, while the front-right and back-left wheels push backward. That's what those $+x$ and $-x$ signs are capturing. The math handles all the combinations at once.

---

## Implementation in Java

Here's a solid starting implementation you can drop into a `LinearOpMode`. It reads from the gamepad and calculates the power for each motor every loop cycle.

```java
@TeleOp
public class MecanumDrive extends LinearOpMode {
    @Override
    public void runOpMode() {
        DcMotor frontLeft = hardwareMap.get(DcMotor.class, "frontLeft");
        DcMotor frontRight = hardwareMap.get(DcMotor.class, "frontRight");
        DcMotor backLeft = hardwareMap.get(DcMotor.class, "backLeft");
        DcMotor backRight = hardwareMap.get(DcMotor.class, "backRight");

        // Reverse the left side if necessary
        frontLeft.setDirection(DcMotorSimple.Direction.REVERSE);
        backLeft.setDirection(DcMotorSimple.Direction.REVERSE);

        waitForStart();

        while (opModeIsActive()) {
            double y = -gamepad1.left_stick_y; // Remember, y is reversed!
            double x = gamepad1.left_stick_x * 1.1; // Counteract imperfect strafing
            double rx = gamepad1.right_stick_x;

            // Denominator is the largest motor power (absolute value) or 1
            // This ensures all the powers maintain the same ratio,
            // but only if at least one is out of the range [-1, 1]
            double denominator = Math.max(Math.abs(y) + Math.abs(x) + Math.abs(rx), 1);
            double frontLeftPower = (y + x + rx) / denominator;
            double backLeftPower = (y - x + rx) / denominator;
            double frontRightPower = (y - x - rx) / denominator;
            double backRightPower = (y + x - rx) / denominator;

            frontLeft.setPower(frontLeftPower);
            backLeft.setPower(backLeftPower);
            frontRight.setPower(frontRightPower);
            backRight.setPower(backRightPower);
        }
    }
}
```

The `denominator` calculation is worth understanding. If your three inputs add up to more than 1.0, you'd be asking a motor to run at more than 100% power, which isn't possible. Dividing all four powers by the largest sum scales everything down proportionally so the relative ratios stay correct and nothing goes out of range.

---

## Tips for Better Mecanum Drive

Weight distribution matters a lot with mecanum wheels. If one corner of your robot is noticeably lighter than the others, that wheel loses traction and your strafing will drift. Try to keep your heaviest components centered and low.

The `1.1` multiplier on the strafe input is a practical fix for a real physical problem. Strafing with mecanum wheels is less efficient than driving forward because of how the roller forces add up, so robots tend to strafe more slowly than they drive. Multiplying the strafe input by a small constant compensates for that. You may need to tune this number for your specific robot.

Once your team gets comfortable with basic robot-centric control, look into field-centric drive. Instead of moving relative to the robot's front, the robot moves relative to a fixed direction on the field. It's a bit more math (you rotate the x/y inputs using the IMU heading), but drivers who learn it usually never want to go back. It makes fine positioning during a match much less stressful.
