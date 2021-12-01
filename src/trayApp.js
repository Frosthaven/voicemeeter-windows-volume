// imports *********************************************************************

// built-in
import * as path from 'path';

// external
import SysTray from 'systray2';

// internal
import { STRING_MENU_ITEMS, STRING_METADATA } from './lib/strings.js';

// menu items
import { itemListBindings } from './menuItems/itemListBindings.js';
import { itemListRestarts } from './menuItems/itemListRestarts.js';
import { itemListPatches } from './menuItems/itemListPatches.js';
import { itemShowVoicemeeter } from './menuItems/voicemeeter/itemShowVoicemeeter.js';
import { itemRestartVoicemeeter } from './menuItems/voicemeeter/itemRestartVoicemeeter.js';
import { itemRestartAudioEngine } from './menuItems/voicemeeter/itemRestartAudioEngine.js';
import { itemVisitGithub } from './menuItems/support/itemVisitGithub.js';
import { itemDonate } from './menuItems/support/itemDonate.js';
import { itemExit } from './menuItems/itemExit.js';
import { getDirName } from './lib/util.js';

// tray app setup **************************************************************
const getTrayApp = (color) => {
    return {
        menu: {
            icon: path.normalize(getDirName() + `/assets/app-${color}.ico`),
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
