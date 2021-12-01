import { getVoicemeeterConnection } from '../../lib/managers/audioSyncManager.js';
import {
    STRING_MENU_ITEMS,
    STRING_CONSOLE_ENTRIES,
} from '../../lib/strings.js';
/**
 * menu entry for restarting the Voicemeeter audio engine
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemRestartAudioEngine = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemRestartAudioEngine'].t,
        enabled: true,
        checked: false,
        button: true,
        click: () => {
            let voicemeeterConnection = getVoicemeeterConnection();
            if (voicemeeterConnection) {
                console.log(
                    STRING_CONSOLE_ENTRIES.restartAudioEngine.replace(
                        '{{REASON}}',
                        STRING_CONSOLE_ENTRIES.restartAudioEngineReasons
                            .userinput
                    )
                );
                voicemeeterConnection.sendCommand('Restart', 1);
            }
        },
    };
};

export { itemRestartAudioEngine };
