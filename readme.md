# Current State

**What works:**

-   `Bind Windows Volume To`
    -   The strips (inputs) and subs (outputs) align with Voicemeeter. When you change Windows volume, that volume will be synced to any selected entries in this list.
-   `Apply Crackle Fix (USB Interfaces)`
    -   This will fix a common crackling and popping issue with software audio mixers and USB interfaces. It does this by limiting audiodg.exe to a single core and giving it high priority.

**What hasn't been added yet:**

-   Start with Windows

This codebase is _mildly dirty_, which will be corrected once feature prototyping is complete.

If you want to try it out, head over to the [releases](https://github.com/Frosthaven/voicemeeter-windows-volume/releases/) page. Simply extract the archive wherever you want and run `voicemeeter-windows-volume.vbs`. Administrator privelages are needed for some features to work.

# Building From Source

## Requirements

-   [NodeJS](https://nodejs.org/) _(Currently on the 16.x line)_
-   [Python](https://www.python.org/downloads/) _(Check to add python to environmental variables)_
-   [NASM](https://www.nasm.us/pub/nasm/releasebuilds/2.15.04/) _(Right click > Run as Administrator)_

Once you have the above tools installed as described, you will need to reboot your computer.

## Commands

-   `npm install` _Installs dependencies_
-   `npm run build` _Builds the projects into the \_dist folder_
-   `npm run rebuild` _Triggers a full rebuild of the node binary, including any changes made to the exe details_

Please refer to package.json for the complete list of commands.
