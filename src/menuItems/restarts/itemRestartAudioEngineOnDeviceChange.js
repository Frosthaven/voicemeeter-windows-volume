import { getVoicemeeterConnection } from '../../lib/managers/audioSyncManager';
import { isToggleChecked } from '../../lib/managers/settingsManager';
import { STRING_CONSOLE_ENTRIES } from '../../lib/strings';
import { AudioEvents } from '../../lib/workers/windowsAudioScanner';

/**
 * menu entry for automatically restarting the audio engine when devices change
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemRestartAudioEngineOnDeviceChange = (props) => {
    return {
        title: STRING_CONSOLE_ENTRIES.restartAudioEngineReasons.devicechange,
        checked: false,
        sid: 'restart_audio_engine_on_device_change',
        enabled: true,
        init: function () {
            AudioEvents.on('device', (devices) => {
                let isEnabled = isToggleChecked(
                    'restart_audio_engine_on_device_change'
                );
                if (isEnabled) {
                    setTimeout(() => {
                        console.log(
                            STRING_CONSOLE_ENTRIES.restartAudioEngine.replace(
                                '{{REASON}}',
                                STRING_CONSOLE_ENTRIES.restartAudioEngineReasons
                                    .devicechange
                            )
                        );
                        let vm = getVoicemeeterConnection();
                        vm && vm.sendCommand('Restart', 1);
                        vm = null;
                    }, 1000);
                }

                isEnabled = null;
            });
        },
    };
};

export { itemRestartAudioEngineOnDeviceChange };
