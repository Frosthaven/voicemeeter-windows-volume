import { waitForProcess } from '../lib/processManager';
import { getSettings } from './settingsManager';
import { systray } from './persistantSysTray';
import { Voicemeeter } from 'voicemeeter-connector';
import { speaker } from 'win-audio';

let vm = null;

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

const startAudioSync = () => {
    runWinAudio();
    connectVoicemeeter();
};

export { startAudioSync };