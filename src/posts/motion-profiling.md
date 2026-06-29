---
title: Motion Profiling
panelCategory: "Control"
date: 2026-05-25
description: Learn how to use trapezoidal motion profiling with FTC drivetrains and single-motor mechanisms.
tags: [completed, software, advanced, novideo]
author: Blueprint
published: true
---

Motion profiling is a way of moving motors smoothly by controlling not just the maximum speed, but also how quickly they speed up and slow down. Instead of telling a motor "go here at full power," you give it a planned trajectory that ramps velocity up gradually, holds it steady, then ramps back down before reaching the target. The result is less wheel slip, less mechanical stress, and movement that is much easier to predict and repeat.

---

## Why Profile a Drivetrain?

When you slam full power into motors from a dead stop, the wheels break traction and skid. That skid throws off any position tracking you have and puts unnecessary wear on your drivetrain. Motion profiling shapes the target velocity over time so the wheels always have a smooth, manageable power curve to follow. The robot accelerates cleanly, cruises at a set speed, then decelerates smoothly before stopping.

---

## What Is a Trapezoid Profile?

A trapezoidal motion profile has three phases:

- **Acceleration:** velocity ramps up from 0 to a maximum.
- **Cruise:** velocity holds constant at the maximum.
- **Deceleration:** velocity ramps back down to 0.

Plot velocity vs. time and you get a shape that looks like a trapezoid. If the target distance is short, the mechanism might not have time to reach max speed before it needs to start slowing down. In that case the cruise phase disappears and you get a triangular profile instead. The math handles this automatically.

---

## How It Connects to Your Controller

Instead of sending a raw position target to your PID controller, you use the profile to generate a reference point at every time step. At any given moment, you know the ideal position, velocity, and acceleration the mechanism should be at. Your PID follows that moving reference rather than a fixed endpoint. This is the same approach used in libraries like Road Runner.

---

## Core Kinematics

The math behind trapezoidal profiling comes from two basic constant-acceleration equations:

$$v = v_0 + a \cdot t$$
$$x = x_0 + v_0 \cdot t + \tfrac{1}{2} a \cdot t^2$$

These let you calculate exactly where the mechanism should be and how fast it should be moving at any point in time along the profile.

---

## Example: Single-Motor Mechanism

This example runs a trapezoidal motion profile on a single `DcMotorEx` (like an arm or slide). The profile is computed inline using the elapsed time, and a simple proportional controller follows the generated setpoint.

```java
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.hardware.DcMotorEx;
import com.qualcomm.robotcore.hardware.PIDCoefficients;
import com.qualcomm.robotcore.util.ElapsedTime;
import com.qualcomm.robotcore.util.Range;

public class SingleMotorProfile extends LinearOpMode {
    private DcMotorEx motor;
    private final ElapsedTime timer = new ElapsedTime();

    // Control target
    private double startPos;
    private double targetPos = 2000; // encoder ticks

    // Profile limits
    private double maxVel   = 1800; // ticks/sec
    private double maxAccel = 2400; // ticks/sec^2

    // PID controller constants
    private double Kp = 0.01;
    private double Kd = 0.0004;

    @Override
    public void runOpMode() throws InterruptedException {
        motor = hardwareMap.get(DcMotorEx.class, "arm");
        motor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        motor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        motor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);

        waitForStart();
        startPos = motor.getCurrentPosition();
        timer.reset();

        while (opModeIsActive()) {
            double t = timer.seconds();
            double error = targetPos - startPos;

            // Compute acceleration time and distance
            double tAccel = maxVel / maxAccel;
            double dAccel = 0.5 * maxAccel * tAccel * tAccel;

            double setpoint;

            // Simplified trapezoidal logic
            if (Math.abs(error) < 2 * dAccel) {
                // Triangular profile (too short to reach max speed)
                double tPeak = Math.sqrt(Math.abs(error) / maxAccel);
                if (t < tPeak) {
                    setpoint = startPos + 0.5 * maxAccel * t * t * Math.signum(error);
                } else if (t < 2 * tPeak) {
                    double td = t - tPeak;
                    setpoint = startPos + (0.5 * maxAccel * tPeak * tPeak + maxAccel * tPeak * td - 0.5 * maxAccel * td * td) * Math.signum(error);
                } else {
                    setpoint = targetPos;
                }
            } else {
                // Full trapezoidal profile
                double dCruise = Math.abs(error) - 2 * dAccel;
                double tCruise = dCruise / maxVel;

                if (t < tAccel) {
                    setpoint = startPos + 0.5 * maxAccel * t * t * Math.signum(error);
                } else if (t < tAccel + tCruise) {
                    setpoint = startPos + (dAccel + maxVel * (t - tAccel)) * Math.signum(error);
                } else if (t < 2 * tAccel + tCruise) {
                    double td = t - tAccel - tCruise;
                    setpoint = startPos + (dAccel + dCruise + maxVel * td - 0.5 * maxAccel * td * td) * Math.signum(error);
                } else {
                    setpoint = targetPos;
                }
            }

            // Apply power using simple P-control
            double currentPos = motor.getCurrentPosition();
            double pOutput = (setpoint - currentPos) * Kp;
            motor.setPower(Range.clip(pOutput, -1.0, 1.0));
            
            telemetry.addData("Setpoint", setpoint);
            telemetry.addData("Position", currentPos);
            telemetry.update();
        }
    }
}
```

---

## Tuning Tips

Start with low values for both `maxVel` and `maxAccel` and work your way up. If the mechanism slips or overshoots, reduce `maxAccel` first since that controls how aggressively the velocity changes. Motion profiles are not magic, but once you dial them in, your autonomous movements will be noticeably more consistent from run to run.
