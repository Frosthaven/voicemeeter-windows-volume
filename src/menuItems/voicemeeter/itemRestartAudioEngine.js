import { getVoicemeeterConnection } from '../../lib/audioSyncManager';
import { STRING_MENU_ITEMS } from '../../lib/strings';
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
                console.log('Restarting audio engine');
                voicemeeterConnection.sendCommand('Restart', 1);
            }
        },
    };
};

export { itemRestartAudioEngine };
