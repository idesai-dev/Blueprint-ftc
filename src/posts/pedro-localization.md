---
title: Pedro Pathing: Localization
panelCategory: "Pedro Pathing"
date: 2026-06-17
description: Understanding and configuring localization in Pedro Pathing.
tags: [ software, advanced, video, completed]
author: Blueprint
published: true
---

<div style="padding: 0.9rem 1.4rem; background: rgba(114, 178, 204, 0.07); border-left: 4px solid var(--accent-cyan); border-radius: 6px; margin-bottom: 1.5rem; font-size: 0.93rem;">
For more detailed information, visit the <a href="https://github.com/Pedro-Pathing" target="_blank" rel="noopener">official Pedro Pathing GitHub</a>.
</div>

# Localization in Pedro Pathing

Localization is how your robot knows where it is on the field. The localizer tracks the robot's X position, Y position, and heading in real time, and the Follower uses that information to make corrections as the robot moves along a path. If your localization is drifting or inaccurate, no amount of tuning your follower constants will fix it - get localization right first.

Pedro supports several localizer options. Here is a breakdown of each one.

## Pinpoint (Recommended)

The GoBILDA Pinpoint Odometry Computer is the best option available for most teams right now. It connects to the Control Hub via I2C and processes the signals from two deadwheel pods on-board, giving you very clean position data with minimal setup on the software side. The hardware setup - wiring the pods into the Pinpoint and mounting it - is covered in the Pinpoint sensor guide. On the Pedro side, you set your localizer to `PINPOINT_LOCALIZER` in your constants file and configure the pod offsets. If you have a Pinpoint available, use it.

## OTOS (SparkFun Optical Tracking Odometry Sensor)

The OTOS is an optical sensor that mounts flat on the underside of the robot and measures movement by watching the surface it is driving on - no deadwheel pods needed. It connects via I2C as well. Some teams prefer this because there are no pods to break or replace during a match. Accuracy is solid for most use cases, though very smooth or shiny floors can give it trouble. Set the localizer to `OTOS_LOCALIZER` in your constants file. Like Pinpoint, it requires offset configuration since the sensor is rarely mounted at the exact center of the robot.

## Two Wheel + IMU

This setup uses two deadwheel pods - one parallel to the robot's forward direction and one perpendicular - along with the Control Hub's built-in IMU to track heading. It is cheaper than Pinpoint since you are skipping the odometry computer, and it works well enough for many teams. The trade-off is that IMU heading can drift over a long auto routine, especially if the robot takes hard hits. Set to `TWO_WHEEL_LOCALIZER` in your constants.

## Three Wheel

Three deadwheel pods - two parallel, one perpendicular - give you enough encoder geometry to compute heading mathematically, without relying on the IMU at all. This makes it more consistent over long routines compared to the two-wheel setup. The downside is more hardware to mount and tune, and the math for the heading calculation requires your pod offsets to be measured accurately. Set to `THREE_WHEEL_LOCALIZER` in your constants.

## Drive Encoder (Not Recommended)

Pedro technically supports using only the drivetrain motor encoders for localization. In practice, this is very inaccurate for mecanum robots because the wheels slip constantly during strafing and rotation. Use this only if you have absolutely no other option and accept that your auto will not be reliable.

## Setting Your Localizer

In your Pedro constants file (usually `FollowerConstants.java` or similar depending on your version), there is a field where you specify which localizer to use. Check the Pedro Pathing GitHub and official docs for the exact field name and syntax for your version - this can change between releases. The Pinpoint and OTOS localizers also need sensor offset values (how far the sensor is from the robot's center of rotation), which are explained in the Pinpoint sensor guide.
