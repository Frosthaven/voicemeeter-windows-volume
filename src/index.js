// imports *********************************************************************

// built-in
import os from 'os';
import path from 'path';

// external
import SysTray from 'systray2';

// local
import { PRIORITIES } from './lib/processManager';
import { setupPersistantSystray } from './lib/persistantSysTray';
import { startAudioSync } from './lib/audioSyncManager';

// menu items
import { itemBindList } from './menuItems/itemBindList';
import { itemRememberVolume } from './menuItems/itemRememberVolume';
import { itemStartWithWindows } from './menuItems/itemStartWithWindows';
import { itemCrackleFix } from './menuItems/itemCrackleFix';
import { itemVolumeFix } from './menuItems/itemVolumeFix';
import { itemVisitGithub } from './menuItems/itemVisitGithub';
import { itemDonate } from './menuItems/itemDonate';
import { itemExit } from './menuItems/itemExit';

// configuration ***************************************************************

// default settings
const defaults = {
    polling_rate: 100,
    gain_min: -60,
    gain_max: 12,
    remember_volume: false,
    disable_donate: false,
    audiodg: {
        priority: PRIORITIES.HIGH,
        affinity: 2,
    },
};
const settingsPath = `${__dirname}/settings.json`;

// tray app menu
const trayApp = {
    menu: {
        icon:
            os.platform() === 'win32'
                ? path.normalize(__dirname + '/assets/app.ico')
                : path.normalize(__dirname + '/assets/app.png'),
        title: 'Voicemeeter Windows Volume',
        tooltip: 'Voicemeeter Windows Volume',
        items: [
            itemBindList(),
            SysTray.separator,
            itemRememberVolume(),
            itemVolumeFix(),
            itemCrackleFix(),
            SysTray.separator,
            itemStartWithWindows(),
            SysTray.separator,
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

// initialize the tray app *****************************************************

const systray = setupPersistantSystray({
    trayApp,
    defaults,
    settingsPath,
    onReady: () => {
        console.log('Starting audio synchronization');
        startAudioSync();
    },
});
