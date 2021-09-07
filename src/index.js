import SysTray from "systray2";
import os from "os";
import path from "path";
import { Voicemeeter, StripProperties } from "voicemeeter-connector";
import { getSettings, loadSettings, saveSettings } from "./settingsManager";
import { clear } from "console";
const processWindows = require("node-process-windows");
const audio = require("win-audio").speaker;

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
    title: "Bind Windows Volume To",
    enabled: true,
    items: [...strips, { Title: "" }, ...buses],
};

const itemStartWithWindows = {
    title: "Start With Windows",
    checked: false,
    sid: "start_with_windows",
    enabled: true,
};

const itemCrackleFix = {
    title: "Apply Crackle Fix",
    checked: false,
    sid: "apply_crackle_fix",
    enabled: true,
};

const itemExit = {
    title: "Exit",
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
            os.platform() === "win32"
                ? path.normalize(__dirname + "/assets/app.ico")
                : path.normalize(__dirname + "/assets/app.png"),
        title: "Voicemeeter Windows Volume",
        tooltip: "Voicemeeter Windows Volume",
        items: [
            itemBindList,
            SysTray.separator, // SysTray.separator is equivalent to a MenuItem with "title" equals "<SEPARATOR>"

            itemCrackleFix,
            itemStartWithWindows,
            SysTray.separator, // SysTray.separator is equivalent to a MenuItem with "title" equals "<SEPARATOR>"
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
        typeof action?.item?.checked === "boolean" ||
        action?.item?.checked === "true" ||
        action?.item?.checked === "false"
    ) {
        action.item.checked = !action.item.checked;
        systray.sendAction({
            type: "update-item",
            item: action.item,
        });
        saveSettings(systray);
    }
});

const runInitCode = () => {
    for (let [key, value] of systray.internalIdMap) {
        if (typeof value.init === "function") {
            value.init(value.checked);
        }
    }
};

const waitForVoicemeeter = (callback) => {
    const activeProcess = processWindows.getProcesses((err, processes) => {
        let running = processes.filter(
            (x) => x.processName === "voicemeeter"
        )[0];
        if (!running) {
            console.log("waiting for voicemeeter...");
            setTimeout(() => {
                waitForVoicemeeter(callback);
            }, 5000);
        } else {
            console.log("connected!");
            callback();
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

    audio.events.on("change", (volume) => {
        if (vm) {
            for (let [key, value] of systray.internalIdMap) {
                if (
                    value.checked &&
                    (value?.sid?.startsWith("Strip") ||
                        value?.sid?.startsWith("Bus"))
                ) {
                    const gain =
                        (volume.new * (settings.gain_max - settings.gain_min)) /
                            100 +
                        settings.gain_min;
                    const roundedGain = Math.round(gain * 10) / 10;
                    const tokens = value.sid.split("_");
                    try {
                        vm.setParameter(
                            tokens[0],
                            tokens[1],
                            "Gain",
                            roundedGain
                        );
                    } catch (e) {}
                }
            }
        }
    });

    audio.events.on("toggle", (status) => {
        // status.new = true or false to indicate mute
        if (vm) {
            for (let [key, value] of systray.internalIdMap) {
                if (
                    value.checked &&
                    (value?.sid?.startsWith("Strip") ||
                        value?.sid?.startsWith("Bus"))
                ) {
                    const tokens = value.sid.split("_");
                    const type = "";
                    const isMute = status.new ? 1 : 0;
                    try {
                        vm.setParameter(tokens[0], tokens[1], "Mute", isMute);
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
        },
        callback: handleSettingsLoaded,
    });
});
