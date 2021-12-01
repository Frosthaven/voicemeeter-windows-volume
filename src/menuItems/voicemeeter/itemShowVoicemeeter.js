import { getVoicemeeterConnection } from '../../lib/managers/audioSyncManager.js';
import { STRING_MENU_ITEMS } from '../../lib/strings.js';

/**
 * menu entry for misc patches and workarounds
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemShowVoicemeeter = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemShowVoicemeeter'].t,
        enabled: true,
        checked: false,
        button: true,
        click: () => {
            let vm = getVoicemeeterConnection();
            vm && vm.sendCommand('Show', 1);
            vm = null;
        },
    };
};
export { itemShowVoicemeeter };
