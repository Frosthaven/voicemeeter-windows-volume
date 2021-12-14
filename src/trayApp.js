// imports *********************************************************************

// built-in
import os from 'os';
import path from 'path';

// external
import SysTray from 'systray2';

// internal
import { STRING_MENU_ITEMS, STRING_METADATA } from './lib/strings';

// menu items
import { itemListBindings } from './menuItems/itemListBindings';
import { itemListRestarts } from './menuItems/itemListRestarts';
import { itemListPatches } from './menuItems/itemListPatches';
import { itemShowVoicemeeter } from './menuItems/voicemeeter/itemShowVoicemeeter';
import { itemRestartVoicemeeter } from './menuItems/voicemeeter/itemRestartVoicemeeter';
import { itemRestartAudioEngine } from './menuItems/voicemeeter/itemRestartAudioEngine';
import { itemVisitGithub } from './menuItems/support/itemVisitGithub';
import { itemDonate } from './menuItems/support/itemDonate';
import { itemExit } from './menuItems/itemExit';

// tray app setup **************************************************************
const getTrayApp = (color) => {
    return {
        menu: {
            icon: path.normalize(__dirname + `/assets/app-${color}.ico`),
            title: STRING_METADATA.friendlyname,
            tooltip: STRING_METADATA.friendlyname,
            items: [
                {
                    title: `${STRING_METADATA.friendlyname.toUpperCase()}\tv${
                        STRING_METADATA.version
                    }`,
                    enabled: false,
                },
                itemListBindings(),
                itemListRestarts(),
                itemListPatches(),
                SysTray.separator,
                { title: STRING_MENU_ITEMS['itemVMTitle'], enabled: false },
                itemShowVoicemeeter(),
                itemRestartVoicemeeter(),
                itemRestartAudioEngine(),
                SysTray.separator,
                {
                    title: STRING_MENU_ITEMS['itemSupportTitle'],
                    enabled: false,
                },
                itemVisitGithub(),
                itemDonate(),
                SysTray.separator,
                itemExit({
                    click: () => {
                        process.exit();
                    },
                }),
            ],
        },
        debug: false,
        copyDir: true, // this is required since we're compiling to an exe
    };
};

export { getTrayApp };
