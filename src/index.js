// standard imports ************************************************************

import os from 'os';
import path from 'path';

// external package imports ****************************************************

import { Voicemeeter } from 'voicemeeter-connector';
import { speaker } from 'win-audio';

// local imports ***************************************************************

import {
    getToggle,
    getSettings,
    loadSettings,
    saveSettings,
} from './lib/settingsManager';

import { PRIORITIES, waitForProcess } from './lib/processManager';
import { PersistantSysTray } from './lib/persistantSysTray';

import { itemBindList } from './menuItems/itemBindList';
import { itemStartWithWindows } from './menuItems/itemStartWithWindows';
import { itemCrackleFix } from './menuItems/itemCrackleFix';
import { itemExit } from './menuItems/itemExit';
// the itemExit entry needs to be moved after we modularize the systray logic
// import { itemExit } from './items/itemExit';

// code ************************************************************************

let vm = null;

const systray = new PersistantSysTray({
    menu: {
        icon:
            os.platform() === 'win32'
                ? path.normalize(__dirname + '/assets/app.ico')
                : path.normalize(__dirname + '/assets/app.png'),
        title: 'Voicemeeter Windows Volume',
        tooltip: 'Voicemeeter Windows Volume',
        items: [
            itemBindList(),
            PersistantSysTray.separator,
            itemCrackleFix(),
            itemStartWithWindows(),
            PersistantSysTray.separator,
            itemExit({
                click: () => {
                    process.exit();
                },
            }),
        ],
    },
    debug: false,
    copyDir: true, // copy go tray binary to outside directory, useful for packing tool like pkg.
});

// @todo: move this into the PersistentSysTray logic
const runInitCode = () => {
    for (let [key, value] of systray.internalIdMap) {
        if (typeof value.init === 'function') {
            value.init.bind(value);
            value.init(value.checked);
        }
    }
};

const connectVoicemeeter = () => {
    waitForProcess(/voicemeeter(.*)?.exe/g, () => {
        Voicemeeter.init().then(async (voicemeeter) => {
            try {
                voicemeeter.connect();
                vm = voicemeeter;
            } catch {
                systray.kill(false);
                setTimeout(() => {
                    process.exit();
                }, 1000);
            }
        });
    });
};

const runWinAudio = () => {
    let settings = getSettings();
    speaker.polling(settings.polling_rate);

    speaker.events.on('change', (volume) => {
        if (vm) {
            for (let [key, value] of systray.internalIdMap) {
                if (
                    value.checked &&
                    (value?.sid?.startsWith('Strip') ||
                        value?.sid?.startsWith('Bus'))
                ) {
                    const gain =
                        (volume.new * (settings.gain_max - settings.gain_min)) /
                            100 +
                        settings.gain_min;
                    const roundedGain = Math.round(gain * 10) / 10;
                    const tokens = value.sid.split('_');
                    try {
                        vm.setParameter(
                            tokens[0],
                            tokens[1],
                            'Gain',
                            roundedGain
                        );
                    } catch (e) {}
                }
            }
        }
    });

    speaker.events.on('toggle', (status) => {
        // status.new = true or false to indicate mute
        if (vm) {
            for (let [key, value] of systray.internalIdMap) {
                if (
                    value.checked &&
                    (value?.sid?.startsWith('Strip') ||
                        value?.sid?.startsWith('Bus'))
                ) {
                    const tokens = value.sid.split('_');
                    const type = '';
                    const isMute = status.new ? 1 : 0;
                    try {
                        vm.setParameter(tokens[0], tokens[1], 'Mute', isMute);
                    } catch (e) {}
                }
            }
        }
    });
};
const handleSettingsLoaded = () => {
    runInitCode();
    runWinAudio();
    connectVoicemeeter();
};

// Systray.ready is a promise which resolves when the tray is ready.
systray.ready().then(() => {
    loadSettings({
        systray,
        settingsPath: `${__dirname}/settings.json`,
        defaults: {
            polling_rate: 200,
            gain_min: -60,
            gain_max: 12,
            audiodg: {
                priority: PRIORITIES.HIGH,
                affinity: 2,
            },
        },
        callback: handleSettingsLoaded,
    });
});
