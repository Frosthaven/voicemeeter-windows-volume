// standard imports ************************************************************

import os from 'os';
import path from 'path';
import { exec } from 'child_process';

// external package imports ****************************************************

import { Voicemeeter } from 'voicemeeter-connector';
import { speaker } from 'win-audio';

// local imports ***************************************************************

import {
    getToggle,
    getSettings,
    loadSettings,
    saveSettings,
} from './settingsManager';

import { PRIORITIES } from './externalCommands';

import { CustomSystray } from './customSystray';
import { itemBindList } from './items/itemBindList';
import { itemStartWithWindows } from './items/itemStartWithWindows';
import { itemCrackleFix } from './items/itemCrackleFix';
// the itemExit entry needs to be moved after we modularize the systray logic
// import { itemExit } from './items/itemExit';

// code ************************************************************************

let vm = null;

const systray = new CustomSystray({
    menu: {
        icon:
            os.platform() === 'win32'
                ? path.normalize(__dirname + '/assets/app.ico')
                : path.normalize(__dirname + '/assets/app.png'),
        title: 'Voicemeeter Windows Volume',
        tooltip: 'Voicemeeter Windows Volume',
        items: [
            itemBindList,
            CustomSystray.separator,
            itemCrackleFix,
            itemStartWithWindows,
            CustomSystray.separator,
            {
                title: 'Exit',
                checked: false,
                enabled: true,
                click: () => {
                    systray.kill(false);
                    setTimeout(() => {
                        process.exit();
                    }, 1000);

                },
            },
        ],
    },
    debug: false,
    copyDir: true, // copy go tray binary to outside directory, useful for packing tool like pkg.
});

systray.onClick((action) => {
    if (action.item.click != null) {
        action.item.click();
    }

    if (
        typeof action?.item?.checked === 'boolean' ||
        action?.item?.checked === 'true' ||
        action?.item?.checked === 'false'
    ) {
        action.item.checked = !action.item.checked;
        systray.sendAction({
            type: 'update-item',
            item: action.item,
        });
        saveSettings(systray);
    }

    if (action?.item?.sid && typeof action?.item?.activate === 'function') {
        action.item.activate.bind(action.item);
        action.item.activate(getToggle(action.item.sid).value);
    }
});

const runInitCode = () => {
    for (let [key, value] of systray.internalIdMap) {
        if (typeof value.init === 'function') {
            value.init.bind(value);
            value.init(value.checked);
        }
    }
};

const checkIfProccessRunning = (query, cb) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32':
            cmd = `tasklist`;
            break;
        case 'darwin':
            cmd = `ps -ax | grep ${query}`;
            break;
        case 'linux':
            cmd = `ps -A`;
            break;
        default:
            break;
    }
    exec(cmd, (err, stdout, stderr) => {
        cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
    });
};

const waitForVoicemeeter = (callback) => {
    checkIfProccessRunning('voicemeeter.exe', (running) => {
        if (running) {
            console.log('connected!');
            callback();
        } else {
            console.log('waiting for voicemeeter...');
            setTimeout(() => {
                waitForVoicemeeter(callback);
            }, 5000);
        }
    });
};

const connectVoicemeeter = () => {
    waitForVoicemeeter(() => {
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
