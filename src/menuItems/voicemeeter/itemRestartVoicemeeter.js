import { getVoicemeeterConnection } from '../../lib/managers/audioSyncManager';
import {
    isProcessRunning,
    restartProcess,
} from '../../lib/managers/processManager';
import { STRING_MENU_ITEMS, STRING_CONSOLE_ENTRIES } from '../../lib/strings';
import { isToggleChecked } from '../../lib/managers/settingsManager';
/**
 * menu entry for restarting the Voicemeeter executable
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemRestartVoicemeeter = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemRestartVoicemeeter'].t,
        enabled: true,
        checked: false,
        button: true,
        click: () => {
            isProcessRunning(/voicemeeter(.*[^(setup)])?.exe/g, (process) => {
                process && restartProcess(process);
                setTimeout(() => {
                    if (isToggleChecked('restart_audio_engine_on_app_launch')) {
                        console.log(
                            STRING_CONSOLE_ENTRIES.restartAudioEngine.replace(
                                '{{REASON}}',
                                STRING_CONSOLE_ENTRIES.restartAudioEngineReasons
                                    .applaunch
                            )
                        );
                        let vm = getVoicemeeterConnection();
                        vm && vm.sendCommand('Restart', 1);
                        vm = null;
                    }
                }, 7000);
            });
        },
    };
};

export { itemRestartVoicemeeter };
