---
title: Color Sensor
panelCategory: "Sensors"
date: 2026-05-06
description: How to read RGB and HSV values from the REV Color Sensor.
tags: ["software", "completed", "beginner"]
author: Blueprint
published: true
---

The REV Color/Range Sensor is one of those sensors that seems niche but ends up being useful in a lot of situations. You can use it to detect team props, check if a game piece made it into your intake, or identify colored tape on the field. It can even double as a short-range distance sensor, which is a nice bonus.

---

## Setting It Up

Use the `NormalizedColorSensor` class. The "normalized" part means your RGB values come back as decimals between 0.0 and 1.0, which makes them consistent regardless of whatever the sensor's internal resolution happens to be.

```java
import com.qualcomm.robotcore.hardware.NormalizedColorSensor;
import com.qualcomm.robotcore.hardware.NormalizedRGBA;

NormalizedColorSensor colorSensor = hardwareMap.get(NormalizedColorSensor.class, "colorSensor");
```

Reading colors is simple. You grab a `NormalizedRGBA` object and pull individual channel values off of it.

```java
NormalizedRGBA colors = colorSensor.getNormalizedColors();

telemetry.addData("Red", "%.3f", colors.red);
telemetry.addData("Green", "%.3f", colors.green);
telemetry.addData("Blue", "%.3f", colors.blue);
```

## Detecting Specific Colors

The simplest approach is to just check which channel has the highest value. If red is bigger than blue and green, you are probably looking at something red.

```java
if (colors.red > colors.blue && colors.red > colors.green) {
    telemetry.addData("Color", "Red Detected");
} else if (colors.blue > colors.red && colors.blue > colors.green) {
    telemetry.addData("Color", "Blue Detected");
}
```

This works, but it breaks down under different lighting conditions. A much better approach is to convert your RGB values to HSV (Hue, Saturation, Value). The hue channel gives you a number on a color wheel, which stays pretty stable even when the lighting changes.

```java
float[] hsvValues = {0F, 0F, 0F};
NormalizedRGBA colors = colorSensor.getNormalizedColors();
Color.colorToHSV(colors.toColor(), hsvValues);

telemetry.addData("Hue", hsvValues[0]);
```

A quick reference for common hue values: red is around 0 or 360, yellow is around 60, and blue is around 240.

## Built-in Distance Sensing

Many REV color sensors (including the V3) can also measure distance. This is super handy for detecting whether a game piece is in your intake. Just cast the sensor to a `DistanceSensor` and call `getDistance()`.

```java
import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;

double distance = ((DistanceSensor) colorSensor).getDistance(DistanceUnit.CM);
telemetry.addData("Distance (cm)", "%.2f", distance);
```

---

Here is a full example that combines color detection and distance sensing. It only reports a color detection if something is within 5 cm, which cuts down on false positives from objects across the room.

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.NormalizedColorSensor;
import com.qualcomm.robotcore.hardware.NormalizedRGBA;
import com.qualcomm.robotcore.hardware.DistanceSensor;
import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;
import android.graphics.Color;

@TeleOp(name = "Normalized Color Sensor Example", group = "Sensor")
public class ColorSensorExample extends LinearOpMode {

    private NormalizedColorSensor colorSensor;

    @Override
    public void runOpMode() {
        colorSensor = hardwareMap.get(NormalizedColorSensor.class, "colorSensor");

        telemetry.addData("Status", "Initialized");
        telemetry.update();

        waitForStart();

        while (opModeIsActive()) {
            // 1. Get normalized colors (0.0 to 1.0)
            NormalizedRGBA colors = colorSensor.getNormalizedColors();
            
            // 2. Convert to HSV
            float[] hsvValues = {0F, 0F, 0F};
            Color.colorToHSV(colors.toColor(), hsvValues);
            
            // 3. Read distance
            double dist = ((DistanceSensor) colorSensor).getDistance(DistanceUnit.CM);

            // 4. Detection logic
            String detected = "NONE";
            if (dist < 5.0) {
                if (hsvValues[0] < 30 || hsvValues[0] > 330) {
                    detected = "RED";
                } else if (hsvValues[0] > 200 && hsvValues[0] < 260) {
                    detected = "BLUE";
                }
            }

            telemetry.addData("Object", detected);
            telemetry.addData("Hue", "%.1f", hsvValues[0]);
            telemetry.addData("Distance (cm)", "%.1f", dist);
            telemetry.update();
        }
    }
}
```

---

> **LED Control:** The REV Color Sensor has a built-in LED. You can toggle it with `colorSensor.enableLed(true)`. Turning it on helps a lot for surface detection since it removes ambient lighting variation, but it can interfere if you are trying to detect objects that are farther away.
