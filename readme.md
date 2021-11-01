# Voicemeeter Windows Volume

Tray app that allows you to sync windows volume and mute state to Voicemeeter volume controls. Made in web technologies. For kicks.

The advantage of this application is that you do not need to fiddle with custom macro keys and related workarounds. Any existing methods to change Windows volume (keyboard keys, software, hardware controls, headset controls, etc) will "just work" and retain your system's volume OSD functionality.

## How To Install

1. Head over to the [releases](https://github.com/Frosthaven/voicemeeter-windows-volume/releases/) page to download the latest version.
2. Download the installer and run it.

## Features

-   `Bind Windows Volume To`
    -   These are the inputs and outputs detected in Voicemeeter. When you change Windows volume, that volume will be synced to any and all checked entries in this list.
-   `Restore Volume At Launch`
    -   This setting allows the app to remember your volume changes while it is open and restore the last known volume on launch. This is useful for users with drivers that reset the volume on startup.
-   `Apply Crackle Fix (USB Interfaces)`
    -   This will fix a common crackling and popping issue with software audio mixers and USB interfaces. It does this by limiting audiodg.exe to a single core and giving it high priority.
-   `Prevent 100% Volume Spikes`
    -   This will detect a driver/Windows issue where devices are reset to 100% audio on audio engine restarts or audio device changes. _Note: This comes with a side effect. Enabling this will prevent the system from ever instantly reaching 100% volume. You can still use volume sliders and keys to reach 100, however._
-   `Automatically Start With Windows`
    -   Registers a scheduled task so that the tray applet launches on user login (with high enough privelages to operate) by default.

## Advanced Configuration

You can also edit some unlisted settings. After running the program at least once, the file `/required/settings.json` is created.

Close the program if it is running, and open that file in a text editor. Here are the options currently available:

-   `polling_rate` is how quickly (in milliseconds) the application will track changes in Windows volume.
-   `gain_min` is the level Voicemeeter will be if Windows volume is at 0
-   `gain_max` is the level Voicemeeter will be if Windows volume is at 100. You can set this to 0 if you prefer Voicemeeter volumes not go into the red.
-   `initial_volume` This is the remembered volume that is set by the "Restore Volume at Launch" setting.
-   `disable_donate` if set to true, the donate link will be hidden from the tray app (donations are optional and nothing is locked behind them).
-   `audiodg` should be left alone unless you know what you are doing. It utilizes Windows priority and affinity codes to set both appropriately when "Apply Crackle Fix" is checked.
-   `toggles` this is an enumerated list of all checkable items in the tray applet.

# Building From Source

## Requirements

-   [NodeJS](https://nodejs.org/) _(Currently on the 16.x line)_
-   [Python v3.6+](https://www.python.org/downloads/) _(Checkbox to add python to the environmental PATH variable)_
-   [NASM](https://www.nasm.us/pub/nasm/releasebuilds/2.15.04/) _(Right click > Run as Administrator)_
-   [Windows Build Tools](https://www.npmjs.com/package/windows-build-tools) _(Visual Studio Community will also have this in the package)_
-   [NSIS v3.07+](https://nsis.sourceforge.io/Download) _(Manually add the NSIS folder that contains makensis.exe to the environmental PATH variable)_

Once you have the above tools installed as described, you will need to reboot your computer.

## Commands

-   `npm install` _Installs dependencies_
-   `npm run build` _Builds the projects into the \_dist folder_
-   `npm run rebuild` _Triggers a full rebuild of the node binary, including any changes made to the exe details_

Please refer to package.json for the complete list of commands.
