import SysTray from 'systray2';
import os from 'os';
import path from 'path';
import { Voicemeeter, StripProperties } from 'voicemeeter-connector';
import {
    getToggle,
    getSettings,
    loadSettings,
    saveSettings,
} from './settingsManager';
import {
    PRIORITIES,
    setProcessPriority,
    setProcessAffinity,
    enableStartOnLaunch,
    disableStartOnLaunch,
} from './externalCommands';
import { PRIORITY_ABOVE_NORMAL, PRIORITY_HIGH } from 'constants';
import { exec } from 'child_process';
const audio = require('win-audio').speaker;

let vm = null;
let strips = [],
    buses = [];

for (let i = 0; i <= 7; i++) {
    strips.push({
        title: `Strip ${i}`,
        sid: `Strip_${i}`,
        init: (checked) => {},
        checked: false,
        enabled: true,
    });

    buses.push({
        title: `Bus ${i}`,
        sid: `Bus_${i}`,
        init: (checked) => {},
        checked: false,
        enabled: true,
    });
}

const itemBindList = {
    title: 'Bind Windows Volume To',
    enabled: true,
    items: [...strips, { Title: '' }, ...buses],
};

const itemStartWithWindows = {
    title: 'Automatically Start With Windows',
    checked: false,
    sid: 'start_with_windows',
    enabled: true,
    init: function (checked) {
        // only run the code here if checked at launch
        checked && this.activate(checked);
    },
    activate: function (checked) {
        if (checked) {
            enableStartOnLaunch();
        } else {
            disableStartOnLaunch();
        }
    },
};

const itemCrackleFix = {
    title: 'Apply Crackle Fix (USB Interfaces)',
    checked: false,
    sid: 'apply_crackle_fix',
    enabled: true,
    init: function (checked) {
        // only run the code here if checked at launch
        checked && this.activate(checked);
    },
    activate: function (checked) {
        const loadedSettings = getSettings().audiodg;
        const audiodg_settings = {
            priority: loadedSettings?.priority || 128,
            affinity: loadedSettings?.affinity || 2,
        };
        if (checked === true) {
            console.log(
                `Setting audiodg.exe priority to ${audiodg_settings.priority} and affinity to ${audiodg_settings.affinity}`
            );
            setProcessPriority('audiodg', audiodg_settings?.priority || 128);
            setProcessAffinity('audiodg', audiodg_settings?.affinity || 2);
        } else {
            console.log(
                `Restoring audiodg.exe priority to ${
                    PRIORITIES.NORMAL
                } and affinity to ${255}`
            );
            setProcessPriority('audiodg', PRIORITIES.NORMAL);
            setProcessAffinity('audiodg', 255);
        }
    },
};

const itemExit = {
    title: 'Exit',
    checked: false,
    enabled: true,
    click: () => {
        systray.kill(false);
        setTimeout(() => {
            process.exit();
        }, 1000);
    },
};

const systray = new SysTray({
    menu: {
        // you should use .png icon on macOS/Linux, and .ico format on Windows
        icon:
            os.platform() === 'win32'
                ? path.normalize(__dirname + '/assets/app.ico')
                : path.normalize(__dirname + '/assets/app.png'),
        title: 'Voicemeeter Windows Volume',
        tooltip: 'Voicemeeter Windows Volume',
        items: [
            itemBindList,
            SysTray.separator,

            itemCrackleFix,
            itemStartWithWindows,
            SysTray.separator,
            itemExit,
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
    audio.polling(settings.polling_rate);

    audio.events.on('change', (volume) => {
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

    audio.events.on('toggle', (status) => {
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
