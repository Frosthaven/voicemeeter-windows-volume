# Current State

This is prototype code. Some features have yet to be implimented:
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
