---
title: Basics of Wiring and Configuration
panelCategory: "Basics"
date: 2026-04-08
description: Essential guide to wiring your FTC robot and configuring it in the app.
tags: [completed, software, beginner, manual, completed]
author: Ishaan Desai
published: true
---

# Basics of Wiring and Configuration

Before any code runs, your robot needs to be wired correctly. Bad wiring is one of the most common sources of problems at competitions. A connector that's halfway seated can look fine on the practice field and then pop out in the middle of a match. This guide walks through how to connect your hardware to the Control Hub or Expansion Hub, and then how to tell your code what's plugged in where.

---

## Wiring Your Robot

### 1. Connecting Motors

Motors plug into the motor ports on the Control Hub or Expansion Hub. Each port has a specific connector type, usually Anderson Powerpole or JST-VH depending on your motor. Make sure you're using the right cable for your specific motor. Plugging in the wrong connector type can damage the port.

### 2. Connecting Servos

Servo cables go into the servo ports. This part trips people up a lot: the black (ground) wire on the servo connector needs to be on the outside edge of the port. If you plug it in backwards you won't damage anything, but the servo won't move either.

### 3. Connecting Sensors

Most FTC sensors connect through one of three port types. I2C ports handle sensors that need to communicate more complex data, like the built-in IMU, color sensors, and distance sensors. Digital ports are for simple on/off signals like touch sensors and limit switches. Analog ports handle sensors that output a variable voltage, like potentiometers.

If you're not sure which port type your sensor uses, check the product page from the manufacturer. REV and other vendors usually list it right in the specs.

---

## Configuring Your Robot in the App

Once everything is wired up, the FTC Robot Controller app needs to know what's connected to which port. This is called the robot configuration. If you skip this step or get the names wrong, your code won't be able to find your devices at runtime.

### 1. Accessing the Configuration

On the Driver Station app, go to **Settings > Configure Robot**. This opens the configuration manager.

### 2. Creating a Configuration

Tap **New** to start a fresh configuration. The app will scan for any hubs that are connected and show them on screen.

### 3. Naming Your Devices

For each port that has something plugged in, select the device type and give it a name. This name is critically important. It has to match exactly, character for character, the string you pass to `hardwareMap.get()` in your Java code. Capitalization counts.

```java
// Example: The name "leftDrive" in the app must match here
DcMotor leftDrive = hardwareMap.get(DcMotor.class, "leftDrive");
```

Pick names that are descriptive and consistent across your codebase. Something like `frontLeft` or `armMotor` is much easier to track down than `motor1`.

---

> After every build session, give your wiring a physical tug test. Every connector should be fully seated and snug. Vibration during a match is surprisingly violent, and loose connectors are responsible for more robot failures than bad code.
