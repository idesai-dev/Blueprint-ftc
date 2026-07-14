---
title: Git and Version Control for FTC Teams
panelCategory: "Basics"
date: 2026-06-25
description: Why FTC teams should use Git, and a practical workflow that avoids common pitfalls.
tags: [software, beginner, completed]
author: Blueprint
published: true
---

Most FTC teams start out sharing code by copying files around, emailing zip folders, or having one person be the only one who ever touches the codebase. This works for a while, but it breaks down fast once more than one person is writing code, or once you need to recover a working version after something breaks right before a competition. Git solves this, and it's worth setting up properly early in the season rather than after you've already lost work to a bad copy-paste.

## What Git Actually Gives You

Git is a version control system: it tracks every change made to your code over time, who made it, and why (through commit messages). This gives you a few concrete things that matter for a competition robotics team:

**History you can go back to.** If a change breaks your autonomous the night before a competition, you can look at exactly what changed and, if needed, revert to the last known-working version instead of trying to manually undo edits from memory.

**Safe collaboration.** Multiple people can work on different parts of the code at the same time without directly overwriting each other's work. Git can usually merge non-conflicting changes automatically, and clearly flags the cases where it can't so a human can resolve them.

**A record of what changed and why.** Good commit messages create a running log of your team's development, which is genuinely useful both for onboarding new programmers and, if your team writes an engineering portfolio, for reconstructing your season's technical decisions.

## GitHub (or Similar) as a Backup

Git alone tracks history locally on your own computer. Pairing it with a hosted service like GitHub gives you a copy of your code that lives somewhere other than a single laptop. If that laptop is lost, stolen, or has a hard drive failure two days before a competition, your code isn't gone with it.

Most FTC teams use a free GitHub repository for this. It also makes it easy for every team member to pull the current code onto their own machine, rather than everything living on one person's laptop.

## A Practical Workflow for a Small Team

You don't need a complicated branching strategy for a typical FTC team. A workflow that works well for most teams:

1. **Keep a working `main` branch.** This should always be code that builds and, as much as possible, actually works on the robot. Avoid committing broken, half-finished code directly to `main`.
2. **Create a branch for new work.** When someone starts a new feature or is trying something experimental, they create a separate branch (`git checkout -b feature-name`) rather than working directly on `main`. This keeps `main` stable while the new work is in progress.
3. **Commit often, with clear messages.** Small, frequent commits with descriptive messages ("add PID tuning for turret" rather than "stuff") make history actually useful later.
4. **Merge back to `main` once it works.** Once a feature branch is tested and working, merge it back into `main` so everyone benefits from it.

For very small teams (one or two programmers), even just committing directly to `main` regularly, with good messages, is a massive improvement over no version control at all. Don't let a "proper" branching workflow be a reason to avoid using Git in the first place.

## Writing Good Commit Messages

A commit message should describe what changed and, ideally, why. "Fixed bug" tells you almost nothing six weeks later when you're trying to find when something broke. "Fix intake stalling when claw is closed during transfer" tells you exactly what to look for.

You don't need to write an essay for every commit. A single clear sentence is usually enough for small changes; save longer explanations for commits that represent a bigger change in approach.

## Handling Merge Conflicts

A merge conflict happens when two people change the same lines of code in different ways, and Git can't automatically decide which version to keep. This isn't a sign something went wrong; it's a normal part of working with a team, and Git is just asking a human to make the call.

When a conflict happens, Git marks the conflicting section directly in the file, showing both versions. Read both versions, decide what the code should actually look like (sometimes it's one version, sometimes it's a combination, sometimes it's something slightly different from both), edit the file to reflect that decision, then mark it resolved and commit.

Conflicts are much easier to resolve when they're small and recent, which is another reason to commit and merge frequently rather than letting one branch drift far from `main` for weeks.

## Common Mistakes

**Not using Git until something breaks.** Most teams try Git after they've already lost work once. Set it up in the first week of the season instead.

**Giant, infrequent commits.** Committing once a week with hundreds of changed lines makes it nearly impossible to figure out what actually changed when something breaks. Commit in small, logical chunks.

**Committing broken code to `main`.** If `main` is regularly broken, it stops being a reliable place to pull working code from, which defeats a lot of the point.

**Ignoring the `.gitignore` file.** Build artifacts, local configuration files, and IDE settings generally shouldn't be committed to the repository. A proper `.gitignore` file (Android Studio and most FTC project templates include a reasonable default) keeps your repository clean and avoids irrelevant merge conflicts.

Setting up Git well takes maybe twenty minutes at the start of the season and pays for itself the first time it saves you from losing work right before a match.
