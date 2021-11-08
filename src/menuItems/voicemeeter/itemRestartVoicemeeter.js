import { isProcessRunning, restartProcess } from '../../lib/processManager';
import { STRING_MENU_ITEMS } from '../../lib/strings';
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
            });
        },
    };
};

export { itemRestartVoicemeeter };
