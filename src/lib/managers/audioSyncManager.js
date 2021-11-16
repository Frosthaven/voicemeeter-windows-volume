import { waitForProcess } from './processManager';
import {
    STRING_VOICEMEETER_FRIENDLY_NAMES,
    STRING_CONSOLE_ENTRIES,
} from '../strings';
import {
    isToggleChecked,
    getSettings,
    setSettings,
    saveSettings,
} from './settingsManager';
import { systray } from '../persistantSysTray';
import { Voicemeeter } from 'voicemeeter-connector';
import {
    AudioEvents,
    getVolume,
    setVolume,
    startAudioScanner,
} from '../workers/windowsAudioScanner';
import { startWindowsEventScanner } from '../workers/windowsEventScanner';
import { debounce } from '../util';

let voicemeeterConnection = null;
let voicemeeterLoaded = false;
let lastVolume = null;
let lastEventTimestamp = Date.now();
let lastVolumeTime = Date.now();

/**
 * called when Windows audio levels have changed
 * @param {*} volume volume change object
 * @param {int} volume.new the new volume
 * @param {int} volume.old the old volume
 */
const winAudioChanged = (volume) => {
    isToggleChecked('remember_volume') && rememberCurrentVolume(volume.new);
};

/**
 * called when Voicemeeter properties have changed
 * @param {*} voicemeeter the voicemeeter connection handle
 */
const voicemeeterChanged = (voicemeeter) => {
    updateBindingLabels();
};

/**
 * saves the current volume to be loaded on next launch
 */
const rememberCurrentVolume = () => {
    console.log(`remembering volume: ${getVolume()}`);
    let settings = getSettings();
    settings.initial_volume = getVolume();
    setSettings(settings);
    saveSettings();
    settings = null;
};

/**
 * if initial_volume is defined in settings, this will apply it to the windows
 * volume slider (and by extension propogate the change to any bound voicemeeter
 * strips and subs)
 */
const setInitialVolume = () => {
    let settings = getSettings();

    if (isToggleChecked('remember_volume') && settings.initial_volume) {
        lastVolumeTime = Date.now();
        console.log(`Set initial volume to ${settings.initial_volume}%`);
        setVolume(settings.initial_volume);
    }

    settings = null;
};

/**
 * connects to the voicemeeter client api once it is available
 */
const connectVoicemeeter = () => {
    return new Promise((resolve, reject) => {
        waitForProcess(/voicemeeter(.*[^(setup)])?.exe/g, () => {
            Voicemeeter.init().then(async (voicemeeter) => {
                try {
                    voicemeeter.connect();

                    // changes happen rapidly on voicemeeter startup, and stop after
                    // the engine is fully loaded. we can wait until changes stop
                    // to detect when the voicemeeter engine is fully loaded
                    let voicemeeterEngineWaiter;

                    voicemeeter.attachChangeEvent(() => {
                        if (!voicemeeterLoaded) {
                            lastEventTimestamp = Date.now();
                        }

                        let moment = new Date();
                        // console.log(
                        //     `Voicemeeter: [${moment.getHours()}:${moment.getMinutes()}:${moment.getSeconds()}] Changed detected`
                        // );
                        moment = null;
                        voicemeeterChanged(voicemeeter);
                    });

                    lastEventTimestamp = Date.now();
                    voicemeeterEngineWaiter = setInterval(() => {
                        let timeDelta = Date.now() - lastEventTimestamp;
                        if (timeDelta >= 3000) {
                            // 3 seconds have passed between events, assume loaded
                            clearInterval(voicemeeterEngineWaiter);
                            voicemeeterLoaded = true;
                            console.log('Voicemeeter: Fully Initialized');
                            resolve(voicemeeter);
                        }
                    }, 1000);

                    voicemeeterConnection = voicemeeter;
                } catch {
                    systray.kill(false);
                    setTimeout(() => {
                        process.exit();
                    }, 1000);
                    reject('Error Attaching to Voicemeeter');
                }
            });
        });
    });
};

/**
 * converts a A windows volume level (0-100) to Voicemeeter decibel level
 */
const convertVolumeToVoicemeeterGain = (windowsVolume, gain_min, gain_max) => {
    if (isToggleChecked('limit_db_gain_to_0')) {
        gain_max = 0;
    }

    const gain = (windowsVolume * (gain_max - gain_min)) / 100 + gain_min;
    const roundedGain = Math.round(gain * 10) / 10;
    return roundedGain;
};

/**
 * begins polling Windows audio for changes, and propegates those changes over
 * the Voicemeeter API
 */
const runWinAudio = () => {
    let settings = getSettings();
    startAudioScanner(settings.polling_rate);

    AudioEvents.on('volume', (volume) => {
        // There is an issue with some drivers and Windows versions where the
        // associated audio device will spike to 100% volume when either devices
        // change or the audio engine is reset. This will revert any 100%
        // volume requests that were not gradual (such as the user using a
        // volume slider)
        let currentTime = Date.now();
        let timeSinceLastVolume = currentTime - lastVolumeTime;

        if (volume.new === 100 && timeSinceLastVolume >= 1000) {
            let fixingVolume = isToggleChecked('apply_volume_fix');

            if (
                fixingVolume &&
                null !== lastVolume &&
                settings.initial_volume !== 100
            ) {
                console.log(
                    `Driver Anomoly Detected: Volume reached 100% from ${lastVolume}%. Reverting to ${lastVolume}%`
                );
                setVolume(lastVolume);
            }
            fixingVolume = null;
        }
        lastVolume = volume.new;
        lastVolumeTime = currentTime;

        // propagate volume to Voicemeeter
        if (voicemeeterConnection) {
            for (let [key, value] of systray.internalIdMap) {
                if (
                    value.checked &&
                    (value?.sid?.startsWith('Strip') ||
                        value?.sid?.startsWith('Bus'))
                ) {
                    let voicemeeterGain = convertVolumeToVoicemeeterGain(
                        volume.new,
                        settings.gain_min,
                        settings.gain_max
                    );
                    let tokens = value.sid.split('_');
                    try {
                        voicemeeterConnection.setParameter(
                            tokens[0],
                            tokens[1],
                            'Gain',
                            voicemeeterGain
                        );
                    } catch (e) {}
                    voicemeeterGain = null;
                    tokens.length = 0;
                    tokens = null;
                }
            }
        }

        currentTime = null;
        timeSinceLastVolume = null;
        winAudioChanged(volume);
    });

    AudioEvents.on('mute', (status) => {
        // status.new = true or false to indicate mute
        if (voicemeeterConnection) {
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
                        voicemeeterConnection.setParameter(
                            tokens[0],
                            tokens[1],
                            'Mute',
                            isMute
                        );
                    } catch (e) {}
                }
            }
        }
    });
};

/**
 * updates all binding entries in the menu with real names, and disables unused
 */
const updateBindingLabels = debounce(() => {
    let vm = getVoicemeeterConnection();
    if (!vm) {
        return;
    }

    let friendlyNames = STRING_VOICEMEETER_FRIENDLY_NAMES[vm.$type];

    if (friendlyNames) {
        for (let [key, value] of systray.internalIdMap) {
            // enable bind menu if needed
            if (value.title === 'Bind Windows Volume To' && !value.enabled) {
                value.enabled = true;
                systray.sendAction({
                    type: 'update-item',
                    item: value,
                });
            }

            // update labels if needed
            if (
                value.sid &&
                (value.sid.startsWith('Strip_') || value.sid.startsWith('Bus_'))
            ) {
                let tokens = value.sid.split('_');
                let type = tokens[0],
                    index = parseInt(tokens[1]);
                let lastTitle = value.title;
                let lastHidden = value.hidden;
                let label = vm.getParameter(type, index, 'Label');
                let deviceName = vm.getParameter(type, index, 'device.name');

                let newFriendlyNames = friendlyNames[type];
                if (newFriendlyNames[index]) {
                    value.title =
                        label.length > 0 ? label : newFriendlyNames[index];

                    value.hidden = false;
                } else {
                    value.hidden = true;
                }

                value.title = `${value.title} ${deviceName ? ' : ' : ''} ${
                    deviceName ? '<' + deviceName + '>' : ''
                }`;

                value.title = value.title.trim();

                // refresh the item only if the state was changed
                if (value.title !== lastTitle || value.hidden !== lastHidden) {
                    systray.sendAction({
                        type: 'update-item',
                        item: value,
                    });
                }

                tokens = null;
                type = null;
                index = null;
                lastTitle = null;
                lastHidden = null;
                label = null;
                deviceName = null;
                newFriendlyNames = null;
            }
        }
    }
    vm = null;
    friendlyNames = null;
}, 5000);

/**
 * gets the instance of the voicemeeter connection
 * @returns {*} the voicemeeter connection object
 */
const getVoicemeeterConnection = () => {
    return voicemeeterConnection;
};

/**
 * begins synchronizing audio between Voicemeeter and Windows
 */
const startAudioSync = () => {
    AudioEvents.on('started', () => {
        setInitialVolume();
        startWindowsEventScanner();
    });

    connectVoicemeeter()
        .then((voicemeeterConnection) => {
            runWinAudio();
            if (isToggleChecked('restart_audio_engine_on_app_launch')) {
                console.log(
                    STRING_CONSOLE_ENTRIES.restartAudioEngine.replace(
                        '{{REASON}}',
                        STRING_CONSOLE_ENTRIES.restartAudioEngineReasons
                            .applaunch
                    )
                );
                voicemeeterConnection.sendCommand('Restart', 1);
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

export { startAudioSync, getVoicemeeterConnection, rememberCurrentVolume };
