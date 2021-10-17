import { waitForProcess } from '../lib/processManager';
import { getSettings } from './settingsManager';
import { systray } from './persistantSysTray';
import { Voicemeeter } from 'voicemeeter-connector';
import { speaker } from 'win-audio';

let vm = null;

/**
 * if initial_volume is defined in settings, this will apply it to the windows
 * volume slider (and by extension propogate the change to any bound voicemeeter
 * strips and subs)
 */
const setInitialVolume = () => {
    let settings = getSettings();

    if (settings.initial_volume) {
        console.log(`Set initial volume to ${settings.initial_volume}`);
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
 * begins polling Windows audio for changes, and propegates those changes over
 * the Voicemeeter API
 */
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

/**
 * begins synchronizing audio between Voicemeeter and Windows
 */
const startAudioSync = () => {
    runWinAudio();
    connectVoicemeeter();
};

export { startAudioSync };
