# Foreword

This is a cursed project. Turn back now. I mean, think about it. Who takes a server-side javascript engine and compiles it into an executable for the purpose of a tray applet? What kind of madman does this? Sometimes solving problems isn't about giving the *best* answer. Sometimes the answers alone are ethereal and impossible to grab. Sometimes, it's the questions that'll take you further. The question I posed was

> What interesting problems and solutions would come about if you applied the wrong technology stack to solve the problem, and forced yourself to keep going?

Introducing the over-engineered monolith of a tray app that is voicemeeter-windows-volume. There is a common unsolved thread that pops up from time to time on message boards - how to hook volume keys to something other than A1. This project will solve that problem - and it will do it *by running node*. There are better languages and toolkits to accomplish this task with, but I'd learn nothing from doing it the *right way*. No, we both know that it is too late for that. This level of discomfort  - the one that you and I share - is *necessary*. Learning to think outside of the box *demands* a certain creative discomfort.

If you find this concept intriguiging through morbid curiosity, or if you are one of the people this solution actually manages to help, then read on and snag your copy!

# Current State

This is prototype code. Some features have yet to be completed:
- Start with Windows
- Crackle Fix (for bypassing USB interface pops in some cases)

The volume and mute sync currently work

This codebase is *mildly dirty*, which will be corrected once feature prototyping is complete.

If you still want to try it out, head over to the [releases](https://github.com/Frosthaven/voicemeeter-windows-volume/releases/) page.

# Building From Source

## Requirements

- [NodeJS](https://nodejs.org/) _(Currently on the 16.x line)_
- [Python](https://www.python.org/downloads/) _(Check to add python to environmental variables)_
- [NASM](https://www.nasm.us/pub/nasm/releasebuilds/2.15.04/) _(Right click > Run as Administrator)_

Once you have the above tools installed as described, you will need to reboot your computer.

- `npm install` _Installs dependencies_
- `npm run build` _Builds the projects into the \_dist folder_
- `npm run rebuild` _Triggers a full rebuild of the node binary, including any changes made to the exe details_
