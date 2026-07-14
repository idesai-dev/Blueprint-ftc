---
title: Android Studio Setup
panelCategory: "Basics"
date: 2026-04-02
description: Complete set up guide for Android Studio on both Windows and Mac.
tags: ["completed", "software", "beginner", "rookie", "video"]
author: Blueprint
published: true
---

![image.png](/images/posts/basics-android-studio/1775352929725_image.png)

Android Studio is the IDE you'll use to write and deploy all of your FTC code. It's a full-featured Java development environment built on top of IntelliJ IDEA. Getting it set up properly the first time saves a lot of headaches later, so follow these steps carefully on your machine.

## Windows Setup

To install Android Studio on a Windows machine:

1. Visit the [Android Studio Download page](https://developer.android.com/studio).
2. Download the executable installer for Windows.
3. Once downloaded, run the installer and make sure you check the boxes for "Android SDK" and "Android Virtual Device" if they come up during install.
4. Follow the setup wizard and accept the default locations. There's no need to customize anything here.
5. Clone or download the FTC SDK repository from GitHub and open that folder from the Android Studio splash screen.
6. Android Studio will spend a few minutes downloading Gradle dependencies the first time. Let it finish completely before you try to build anything. Once it says the sync is done, you're good to go.

## Mac Setup

To install Android Studio on a macOS machine:

1. Visit the [Android Studio Download page](https://developer.android.com/studio).
2. Choose the right download for your processor type. If you have a newer Mac with an M-series chip, pick Apple Silicon. If you have an older Intel Mac, pick the Intel version.
3. Open the `.dmg` file once it downloads and drag Android Studio into your Applications folder.
4. Open the app. The first time you launch it, a Setup Wizard will walk you through downloading the SDK. Just go with the standard options and let it do its thing.
5. Open your cloned FTC SDK folder using the `Open...` option on the Welcome screen.
6. Wait for the Gradle sync to finish, and your environment is ready.

One thing to double-check on both platforms: make sure your OS can actually detect the REV Control Hub. On Windows you may need to install a USB driver. On Mac it usually works over Wi-Fi automatically, but if you're connecting via USB, make sure ADB (Android Debug Bridge) has the permissions it needs to communicate with the hub.
