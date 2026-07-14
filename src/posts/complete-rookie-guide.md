---
title: 'Complete Rookie Guide'
panelCategory: "Judging & Portfolio"
date: 2026-06-20
description: 'A comprehensive guide for FTC rookies covering everything from team setup to your first robot.'
tags:
  - rookie
  - guide
published: true
---

Welcome to FTC. If you just formed a team and have no idea where to start, you are in the right place. This guide covers everything a brand new team needs to know: what the competition looks like, how to build your first robot, how to write your first programs, and how to actually show up to a tournament ready to compete.

This is meant to be read in order, but feel free to jump around if you need a specific topic.

---

## 1. What Is FTC?

**FIRST Tech Challenge** (FTC) is a robotics competition for students in grades 7 through 12. Each season, a new game is released with unique challenges. Teams build and program robots to compete in matches on a 12x12 foot field.

A match has two alliances: Red and Blue. Each alliance has two teams. Every match is two and a half minutes total:

- **Autonomous period** (30 seconds): Your robot runs completely on its own using pre-programmed instructions. No driver input.
- **TeleOp period** (2 minutes, 30 seconds): Your drivers take over and control the robot using gamepads.

### The Season Structure

The FTC season follows a predictable timeline every year:

1. **Kickoff** (usually early September): The new game is revealed. This is the most exciting day of the season. Watch the reveal video and read the game manual carefully.
2. **Build and practice season** (September through December): Your team builds the robot, writes code, and practices. Many regions hold scrimmages during this time where you can test your robot in a competition setting without it counting.
3. **Qualifier tournaments** (October through January): Your first real competitions. Usually 20 to 40 teams attend, each playing several qualification matches solo to build a ranking. Top-ranked teams then captain 2-team alliances for elimination rounds, and the winning alliance advances.
4. **Regional/State championships** (January through March): Qualifying teams compete at a higher level. The rules vary by region.
5. **World Championship** (April): The best teams from around the world compete in Houston, Texas.

---

## 2. Team Roles

A strong FTC team divides responsibilities so nothing falls through the cracks. Here are the key roles most teams have:

**Drive Coach**: The person who stands at the driver station and calls strategy during matches. Usually an experienced student or mentor who knows the game well. The drive coach directs the two drivers.

**Driver 1 (gamepad1)**: Controls the drivetrain and moves the robot around the field.

**Driver 2 / Operator (gamepad2)**: Controls attachments like arms, claws, lifts, and intake mechanisms. Usually the more technically skilled driver.

**Programmers**: Write and test the autonomous and TeleOp code. They need to understand the robot's hardware as well as the software.

**Builders / Mechanical**: Design and assemble the robot. They work closely with programmers to make sure everything is wired and mounted correctly.

**Notebookers**: Maintain the Engineering Notebook, which documents the entire design process. This is critical for judged awards. See section 12 for more on notebooks.

**Outreach Lead**: Organizes community outreach events, which are often required or heavily weighted for judged awards like the Inspire Award.

One person can fill multiple roles, especially on smaller teams. Just make sure every role is covered.

---

## 3. Reading the Game Manual

Every FTC season has two key documents:

- **Game Manual Part 1**: Rules that stay the same every season. Robot rules, field rules, safety requirements, alliance selection, and judging criteria all live here.
- **Game Manual Part 2**: Released at kickoff. This is the new game-specific manual. Read it cover to cover. Every word matters.

Download both from the official FIRST website. Highlight everything that affects how you build or program your robot. Pay close attention to the **scoring section** so you know which tasks are worth the most points.

---

## 4. Your Hardware Checklist

Here is what you need to get your robot running:

**Electronics:**
- REV Control Hub (the brain of the robot)
- REV Driver Hub OR an Android phone for the Driver Station
- 12V FTC-legal battery (REV Slim Battery is common)
- REV Expansion Hub (optional, gives you more ports)

**Motors and Servos:**
- At least 4 DC motors for a mecanum drivetrain (goBILDA 5202 series or REV HD Hex motors are popular)
- Servos for mechanisms (goBILDA or REV servos work well)

**Sensors:**
- Encoders (most motors have built-in encoders)
- IMU (built into the Control Hub)
- Webcam or camera for vision (optional for beginners)

**Wiring:**
- JST-PH cables for motors
- Servo cables
- Anderson PowerPole cables for battery connection
- XT30 connectors

**Structure:**
- Extrusion (goBILDA or REV extrusion)
- Brackets, screws, and other hardware

---

## 5. Understanding the REV Control Hub

The **Control Hub** is the brain of your robot. It runs Android and connects directly to the Driver Station over Wi-Fi. All your motors, servos, and sensors plug into it.

Key ports on the Control Hub:

- **Motor ports 0-3**: Four DC motor ports labeled 0, 1, 2, 3. Motor cables use JST-VH connectors.
- **Servo ports 0-5**: Six servo ports.
- **I2C ports**: For sensors like color sensors or distance sensors.
- **Digital/Analog ports**: For encoders, touch sensors, etc.
- **USB port**: For connecting a webcam.
- **XT30 power connector**: Where your 12V battery plugs in.

The Control Hub also has a built-in IMU (gyroscope and accelerometer) which is useful for autonomous navigation.

> Keep your Control Hub mounted securely on the robot and protect it from impacts. It is the most expensive and important component on your robot.

---

## 6. Building Your First Robot

### Start With the Drivetrain

Do not try to build a fully featured robot on day one. Get the drivetrain working first. A robot that can drive is better than a robot that can do everything but falls apart.

**Mecanum wheels** are strongly recommended for FTC. Unlike regular wheels, mecanum wheels have rollers set at 45-degree angles on the outside. This lets the robot move sideways, diagonally, and rotate in place, all without turning the entire robot. That kind of maneuverability is extremely valuable on the field.

A mecanum drivetrain uses four wheels: front left, front right, back left, and back right. Each wheel is driven by its own motor.

When setting up mecanum wheels:
- The front left and back right wheels should have rollers that form an X when viewed from above. Same for front right and back left.
- If you put the wheels on wrong, the robot will not strafe correctly.

### The 4-Motor Setup

Mount one motor at each corner of your drivetrain frame. Use goBILDA or REV motor mounts to attach them cleanly. Run your motor cables back toward the Control Hub, leaving enough slack so the robot can move without pulling on the wires.

Keep the robot as low and compact as possible. A lower center of gravity helps stability.

### Do Not Overcomplicate It

Many rookie teams try to build an elaborate mechanism for their first robot and end up with something that breaks constantly. A reliable drivetrain that scores consistently in TeleOp beats a broken complex robot every time. Get driving first, then add mechanisms one at a time.

---

## 7. Wiring Basics

Good wiring is not optional. Loose wires cause more match failures than bad code.

**Naming convention**: Pick consistent names for your motors and stick to them everywhere. A popular convention is:
- `frontLeft`, `frontRight`, `backLeft`, `backRight` for drive motors
- Descriptive names for other motors: `slideMotor`, `intakeMotor`, etc.

**Motor ports**: Plug motor cables into ports 0-3 on the Control Hub. Keep track of which port each motor is in.

**Servo ports**: Plug servo cables into servo ports 0-5. Make note of which port each servo is on.

**Battery**: Connect the 12V battery to the XT30 power connector through a master power switch. Always use the power switch so you can cut power quickly.

**Cable management tips:**
- Use zip ties to bundle cables along the frame.
- Leave enough slack for moving parts.
- Do not run power wires and signal wires in the same bundle if you can avoid it (reduces electrical interference).
- Label your cables. You will thank yourself later.

---

## 8. Software Setup

FTC code is written in **Java** using **Android Studio**. Here is how to get set up:

1. **Download Android Studio** from the official Android developer website.
2. **Clone the FTC SDK** from GitHub: `https://github.com/FIRST-Tech-Challenge/FtcRobotController`. This is the official starter project maintained by FIRST.
3. Open the project in Android Studio and let it sync and download dependencies. This can take a while the first time.
4. Your team's code goes in the `TeamCode` folder inside the project.

Connect your Control Hub to your computer via USB and use Android Studio to deploy code directly to it. The Control Hub shows up as an Android device in the device list.

> Make sure your Android Studio project is on the latest FTC SDK version. FIRST releases updates throughout the season and sometimes changes are required for competition legality.

See our full [Android Studio Setup guide](/software/basics-android-studio) for step-by-step instructions for both Windows and Mac.

---

## 9. Robot Configuration

Before your code can talk to the hardware, you need to create a **configuration** on the Driver Station that maps hardware names to physical ports.

1. Connect the Driver Station to the Control Hub (over Wi-Fi Direct or USB).
2. On the Driver Station app, go to the menu and select **Configure Robot**.
3. Create a new configuration. Add your motors by selecting the port they are in and giving them names that match what you will use in code. For example: port 0 = `frontLeft`.
4. Add your servos similarly.
5. Save and activate the configuration.

The names you type here must match **exactly** what you use in your code with `hardwareMap.get()`. A single typo will cause a runtime crash.

For more detail on wiring and configuration, see our [Wiring and Configuration guide](/software/basics-wiring).

---

## 10. Your First TeleOp Program

Here is a complete mecanum drive TeleOp program you can use as a starting point:

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.DcMotorSimple;

@TeleOp(name = "Drive TeleOp", group = "TeleOp")
public class DriveTeleOp extends LinearOpMode {

    DcMotor frontLeft, frontRight, backLeft, backRight;

    @Override
    public void runOpMode() {

        frontLeft  = hardwareMap.get(DcMotor.class, "frontLeft");
        frontRight = hardwareMap.get(DcMotor.class, "frontRight");
        backLeft   = hardwareMap.get(DcMotor.class, "backLeft");
        backRight  = hardwareMap.get(DcMotor.class, "backRight");

        // Reverse left side so all wheels drive in the same direction
        frontLeft.setDirection(DcMotorSimple.Direction.REVERSE);
        backLeft.setDirection(DcMotorSimple.Direction.REVERSE);

        telemetry.addData("Status", "Ready to Start");
        telemetry.update();

        waitForStart();

        while (opModeIsActive()) {

            double y  = -gamepad1.left_stick_y; // forward/backward (negated)
            double x  =  gamepad1.left_stick_x; // strafe
            double rx =  gamepad1.right_stick_x; // rotation

            // Normalize so no motor exceeds 1.0
            double denominator = Math.max(Math.abs(y) + Math.abs(x) + Math.abs(rx), 1);

            frontLeft.setPower((y + x + rx) / denominator);
            frontRight.setPower((y - x - rx) / denominator);
            backLeft.setPower((y - x + rx) / denominator);
            backRight.setPower((y + x - rx) / denominator);

            telemetry.addData("Forward", y);
            telemetry.addData("Strafe",  x);
            telemetry.addData("Rotate",  rx);
            telemetry.update();
        }
    }
}
```

For a deeper explanation of this code, see our [TeleOp Introduction](/software/teleop-introduction) and [TeleOp Beginner](/software/teleop-beginner) guides.

---

## 11. Your First Autonomous Program

Autonomous runs for 30 seconds at the start of every match. Your robot must score without any driver input. Even a basic autonomous that scores a few points can be the difference between qualifying and going home.

The simplest approach is **encoder-based driving**: use the motor's built-in encoder to measure how far you have traveled and stop at a set distance.

Here is a helper function you can use:

```java
// Drive forward a set number of inches using encoder ticks
int TICKS_PER_INCH = 45; // approximate for goBILDA 5202 series motors

public void driveForward(double inches, double power) {
    int ticks = (int)(inches * TICKS_PER_INCH);
    frontLeft.setTargetPosition(frontLeft.getCurrentPosition() + ticks);
    frontRight.setTargetPosition(frontRight.getCurrentPosition() + ticks);
    backLeft.setTargetPosition(backLeft.getCurrentPosition() + ticks);
    backRight.setTargetPosition(backRight.getCurrentPosition() + ticks);

    frontLeft.setMode(DcMotor.RunMode.RUN_TO_POSITION);
    frontRight.setMode(DcMotor.RunMode.RUN_TO_POSITION);
    backLeft.setMode(DcMotor.RunMode.RUN_TO_POSITION);
    backRight.setMode(DcMotor.RunMode.RUN_TO_POSITION);

    frontLeft.setPower(power);
    frontRight.setPower(power);
    backLeft.setPower(power);
    backRight.setPower(power);

    while (opModeIsActive() && (frontLeft.isBusy() || frontRight.isBusy())) {
        telemetry.addData("Driving", "Forward %.0f inches", inches);
        telemetry.update();
    }

    frontLeft.setPower(0);
    frontRight.setPower(0);
    backLeft.setPower(0);
    backRight.setPower(0);
}
```

Call it from `runOpMode()` after `waitForStart()`:

```java
waitForStart();

driveForward(24, 0.5); // drive forward 24 inches at half power
```

A few notes:
- The `TICKS_PER_INCH` value depends on your motor model and wheel size. 45 is a reasonable starting approximation for goBILDA 5202 motors with 4-inch wheels. Measure and calibrate yours.
- `RUN_TO_POSITION` mode tells the motor controller to drive to the target position and hold there. You set the power as a speed limit, not a direction.
- Always call `setPower(0)` on all motors after movement to stop them cleanly.

For more detail, see our full [Encoder Autonomous Introduction](/software/encoder-autonomous-introduction) guide. For advanced techniques like smooth path following, check out [gm0.org](https://gm0.org).

---

## 12. The Engineering Notebook

Judges at FTC tournaments evaluate teams on more than just robot performance. They look at your **Engineering Notebook**, which documents your entire design process throughout the season.

A strong notebook includes:

- **Team bios and roles**: Who is on your team and what does each person do?
- **Game analysis**: What did you decide to focus on after reading the game manual and why?
- **Design iterations**: Every design you tried, including the ones that failed. Judges love to see that you learned from failures.
- **Test results**: Data from testing your robot. Measurements, times, accuracy percentages.
- **Meeting notes**: Brief summaries of what you worked on at each meeting.
- **Reflection entries**: What did you learn? What would you do differently?

Start the notebook on day one of the season, not the week before competition. It should be a running record of your season, not a retrospective summary.

> Many major awards (like the Inspire Award, which is the highest in FTC) heavily weight the notebook and interview. A great notebook can carry a team far even if their robot is not the fastest on the field.

---

## 13. Competition Day Tips

Competition day can be stressful, especially your first time. Here is what to expect and how to prepare:

**Before the event:**
- Fully charge your Control Hub and Driver Hub the night before.
- Bring at least two charged 12V batteries.
- Pack spare parts: extra screws, zip ties, a screwdriver set, electrical tape, spare servo.
- Test your robot that morning. A fresh deploy and a few practice runs go a long way.

**At inspection:**
- Every robot goes through a technical inspection before competing. Inspectors check robot dimensions, weight, and that all hardware meets the game manual rules.
- Know your robot's dimensions and weight. Violations can disqualify you.

**During matches:**
- Drive coach calls strategy. Drivers focus on the robot.
- Communicate clearly and calmly.
- After each match, take notes on what worked and what did not.

**Between matches:**
- You may have only 15 to 30 minutes between matches. Prioritize critical repairs over nice-to-haves.
- Stay near the pit and be ready when they call your team number.

**Scouting:**
- Watch other teams' robots and take notes on what they are doing well.
- During alliance selection, this information helps you pick a strong partner.

---

## 14. Where to Learn More

You are not on your own. The FTC community is genuinely one of the most helpful robotics communities out there.

**Resources we recommend:**

- **[gm0.org (Game Manual Zero)](https://gm0.org)**: The single best community-maintained guide for FTC hardware, software, and strategy. Bookmark it.
- **FTC Discord**: A large, active community of FTC students, mentors, and alumni. Great for quick questions and getting advice from experienced teams.
- **Brogran Pratt on YouTube**: Search for Brogran Pratt on YouTube. His channel has excellent FTC walkthroughs that are beginner-friendly and practical.
- **FIRST's official YouTube channel**: Game reveal videos, training materials, and tutorials from FIRST directly.

**Blueprint guides to work through next:**

- [Getting Started](/software/getting-started): overview of the FTC ecosystem
- [Android Studio Setup](/software/basics-android-studio): full installation walkthrough
- [Wiring and Configuration](/software/basics-wiring): connecting hardware and naming devices
- [Motors and Servos](/software/basics-motors-servos): how to control your actuators
- [Types of OpModes](/software/basics-types-of-opmodes): LinearOpMode vs. OpMode explained
- [Mecanum Drivetrain](/software/mecanum-drivetrain): the full mecanum math
- [TeleOp Introduction](/software/teleop-introduction): how TeleOp works
- [TeleOp Beginner](/software/teleop-beginner): your first full driving program
- [Finite State Machines](/software/teleop-fsm): cleaner button handling with FSMs
- [Encoder Autonomous Introduction](/software/encoder-autonomous-introduction): distance-based autonomous
- [Encoder Drivetrain Functions](/software/encoder-autonomous-drivetrain-functions): helper functions for autonomous movement
- [Sensors: IMU](/software/sensors-imu): using the built-in gyroscope

---

You have everything you need to get started. Build something simple, test it early, document as you go, and do not be afraid to ask for help. Every experienced FTC team was once exactly where you are right now. Good luck this season.
