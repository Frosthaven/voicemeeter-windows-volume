import { waitForProcess } from '../lib/processManager';
import { getToggle, getSettings } from './settingsManager';
import { systray } from './persistantSysTray';
import { Voicemeeter } from 'voicemeeter-connector';
import { speaker } from 'win-audio';

let vm = null;
let lastVolume = null;
let lastVolumeTime = Date.now();

/**
 * if initial_volume is defined in settings, this will apply it to the windows
 * volume slider (and by extension propogate the change to any bound voicemeeter
 * strips and subs)
 */
const setInitialVolume = () => {
    let settings = getSettings();

    if (settings.initial_volume) {
        lastVolumeTime = Date.now();
        console.log(`Set initial volume to ${settings.initial_volume}%`);
        speaker.set(settings.initial_volume);
    }
};

/**
 * connects to the voicemeeter client api once it is available
 */
const connectVoicemeeter = () => {
    waitForProcess(/voicemeeter(.*)?.exe/g, () => {
        Voicemeeter.init().then(async (voicemeeter) => {
            try {
                voicemeeter.connect();

                // changes happen rapidly on voicemeeter startup, and stop after
                // the engine is fully loaded. we can wait until changes stop
                // to detect when the voicemeeter engine is fully loaded
                let voicemeeterLoaded = false;
                let voicemeeterEngineWaiter;

                console.log(
                    voicemeeter.updateDeviceList(),
                    voicemeeter.$outputDevices,
                    voicemeeter.$inputDevices
                );
                voicemeeter.attachChangeEvent(() => {
                    if (!voicemeeterLoaded) {
                        lastEventTimestamp = Date.now();
                    }

                    let moment = new Date();
                    console.log(
                        `Voicemeeter: [${moment.getHours()}:${moment.getMinutes()}:${moment.getSeconds()}] Changed detected`
                    );
                });

                let lastEventTimestamp = Date.now();
                voicemeeterEngineWaiter = setInterval(() => {
                    let timeDelta = Date.now() - lastEventTimestamp;
                    if (timeDelta >= 3000) {
                        // 3 seconds have passed between events, assume loaded
                        clearInterval(voicemeeterEngineWaiter);
                        voicemeeterLoaded = true;
                        console.log('Voicemeeter: Fully Initialized');
                        setInitialVolume();
                    }
                }, 1000);

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

/**
 * converts a A windows volume level (0-100) to Voicemeeter decibel level
 */
const convertVolumeToVoicemeeterGain = (windowsVolume, gain_min, gain_max) => {
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
    speaker.polling(settings.polling_rate);

    speaker.events.on('change', (volume) => {
        // There is an issue with some drivers and Windows versions where the
        // associated audio device will spike to 100% volume when either devices
        // change or the audio engine is reset. This will revert any 100%
        // volume requests that were not gradual (such as the user using a
        // volume slider)
        let currentTime = Date.now();
        let timeSinceLastVolume = currentTime - lastVolumeTime;

        if (volume.new === 100 && timeSinceLastVolume >= 1000) {
            let fixingVolume = getToggle('apply_volume_fix');

            if (
                fixingVolume &&
                null !== lastVolume &&
                settings.initial_volume !== 100
            ) {
                console.log(
                    `Driver Anomoly Detected: Volume reached 100% from ${lastVolume}%. Reverting to ${lastVolume}%`
                );
                speaker.set(lastVolume);
            }
        }
        lastVolume = volume.new;
        lastVolumeTime = currentTime;

        // propagate volume to Voicemeeter
        if (vm) {
            for (let [key, value] of systray.internalIdMap) {
                if (
                    value.checked &&
                    (value?.sid?.startsWith('Strip') ||
                        value?.sid?.startsWith('Bus'))
                ) {
                    const voicemeeterGain = convertVolumeToVoicemeeterGain(
                        volume.new,
                        settings.gain_min,
                        settings.gain_max
                    );
                    const tokens = value.sid.split('_');
                    try {
                        vm.setParameter(
                            tokens[0],
                            tokens[1],
                            'Gain',
                            voicemeeterGain
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

/**
 * begins synchronizing audio between Voicemeeter and Windows
 */
const startAudioSync = () => {
    runWinAudio();
    connectVoicemeeter();
};

export { startAudioSync };
