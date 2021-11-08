import { getVoicemeeterConnection } from '../lib/audioSyncManager';
import { STRING_MENU_ITEMS } from '../lib/strings';
import { systemEvents } from '../lib/systemEvents';

/**
 * menu entry for automatically restarting the audio engine when devices change
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemRestartAudioEngineOnDeviceChange = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemRestartAudioEngineOnDeviceChange'].t,
        checked: false,
        sid: 'restart_audio_engine_on_device_change',
        enabled: true,
        init: function (checked) {
            systemEvents.on('any', (data) => {
                setTimeout(() => {
                    console.log('restarting audio engine');
                    let vm = getVoicemeeterConnection();
                    vm && vm.sendCommand('Restart', 1);
                }, 3000);
            });
            checked && this.activate(checked);
        },
        activate: function (checked) {
            if (checked) {
                systemEvents.startPolling();
            } else {
                systemEvents.stopPolling();
            }
        },
    };
};

export { itemRestartAudioEngineOnDeviceChange };
