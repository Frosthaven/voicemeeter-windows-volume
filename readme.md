# Voicemeeter Windows Volume

## How To Install

1. Head over to the [releases](https://github.com/Frosthaven/voicemeeter-windows-volume/releases/) page to download the archive of the newest version.
1. Extract the archive anywhere you want to run the program from.
1. Double click `voicemeeter-windows-volume.vbs` to start the tray application.

## Features

-   `Bind Windows Volume To`
    -   The strips (inputs) and subs (outputs) align with Voicemeeter. When you change Windows volume, that volume will be synced to any selected entries in this list.
-   `Apply Crackle Fix (USB Interfaces)`
    -   This will fix a common crackling and popping issue with software audio mixers and USB interfaces. It does this by limiting audiodg.exe to a single core and giving it high priority.
-   `Automatically Start With Windows`
    -   Registers a scheduled task so that the tray applet launches on user login (with high enough privelages to operate) by default.

## Advanced Configuration

You can also edit some unlisted settings. After running the program at least once, the file `/required/settings.json` is created.

Close the program if it is running, and open that file in a text editor. Here are the options currently available:

-   `polling_rate` is how quickly (in milliseconds) the application will track changes in Windows volume.
-   `gain_min` is the level Voicemeeter will be if Windows volume is at 0 _(I set this to around -31 on my system, as below that is inaudible)_
-   `gain_max` is the level Voicemeeter will be if Windows volume is at 100. You can set this to 0 if you prefer Voicemeeter volumes not go into the red.
-   `audiodg` should be left alone unless you know what you are doing. It utilizes Windows priority and affinity codes to set both appropriately when "Apply Crackle Fix" is checked.
-   `toggles` this is an enumerated list of all checkable items in the tray applet.

# Building From Source

## Note About This Codebase

This codebase is _mildly dirty_, which will be corrected once feature prototyping is complete.

## Requirements

-   [NodeJS](https://nodejs.org/) _(Currently on the 16.x line)_
-   [Python v3.6+](https://www.python.org/downloads/) _(Check to add python to environmental variables)_
-   [NASM](https://www.nasm.us/pub/nasm/releasebuilds/2.15.04/) _(Right click > Run as Administrator)_
-   [Windows Build Tools](https://www.npmjs.com/package/windows-build-tools) _Visual Studio Community will also have this in the package_

Once you have the above tools installed as described, you will need to reboot your computer.

## Commands

-   `npm install` _Installs dependencies_
-   `npm run build` _Builds the projects into the \_dist folder_
-   `npm run rebuild` _Triggers a full rebuild of the node binary, including any changes made to the exe details_

Please refer to package.json for the complete list of commands.
