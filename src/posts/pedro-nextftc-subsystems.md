---
title: NextFTC Subsystems
panelCategory: "Pedro Pathing"
date: 2026-06-23
description: Building modular and reusable robot mechanisms using the NextFTC framework.
tags: [completed, software, intermediate]
author: Ishaan Desai
published: true
---

<div style="padding: 0.9rem 1.4rem; background: rgba(114, 178, 204, 0.07); border-left: 4px solid var(--accent-cyan); border-radius: 6px; margin-bottom: 1.5rem; font-size: 0.93rem;">
For more detailed information, visit the <a href="https://github.com/NextFTC/NextFTC" target="_blank" rel="noopener">official NextFTC GitHub</a> and the <a href="https://github.com/Pedro-Pathing" target="_blank" rel="noopener">Pedro Pathing GitHub</a>.
</div>

NextFTC is a powerful command-based framework for FTC that helps you organize your robot code into **Subsystems** and **Commands**. This makes your code more modular, easier to test, and prevents hardware conflicts.

## What is a Subsystem?

A subsystem is a class that represents a physical mechanism on your robot (e.g., an Arm, an Intake, or a Lift). It contains the hardware objects (motors, servos) and the basic methods to control them.

### Creating a Subsystem

In NextFTC, every subsystem should implement the `Subsystem` interface. We also recommend using the **Singleton** pattern to ensure you only have one instance of each mechanism.

```java
public class Lift implements Subsystem {
    // Singleton instance
    public static final Lift INSTANCE = new Lift();

    private MotorEx liftMotor;

    private Lift() {
        // Private constructor for Singleton
    }

    @Override
    public void initialize() {
        liftMotor = new MotorEx("liftMotor");
        liftMotor.setRunMode(Motor.RunMode.RUN_USING_ENCODER);
    }

    @Override
    public void periodic() {
        // This runs every single loop
        // Perfect for PID updates or safety checks
    }

    public void setPower(double power) {
        liftMotor.setPower(power);
    }
}
```

## Creating Commands

Commands are the actions your subsystems perform. For example, `LiftToPosition` or `IntakeCollect`.

```java
public class LiftToTop extends Command {
    public LiftToTop() {
        // Tell the scheduler this command needs the Lift
        requires(Lift.INSTANCE);
    }

    @Override
    public void initialize() {
        Lift.INSTANCE.setPower(0.8);
    }

    @Override
    public boolean isFinished() {
        // Return true when the lift reaches the target
        return Lift.INSTANCE.isAtTop();
    }
}
```

## Why This is Better

- **Automatic Conflict Resolution:** If you try to run two commands that both require the `Lift`, NextFTC will automatically stop the old one and start the new one.
- **Cleaner OpModes:** Your OpModes become a simple list of commands rather than a mess of loops and state variables.
- **Reusability:** You can easily reuse your subsystems and commands across different autonomous and TeleOp routines.
