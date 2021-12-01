import {
    enableStartOnLaunch,
    disableStartOnLaunch,
} from '../../lib/managers/autoStartManager.js';
import { STRING_MENU_ITEMS } from '../../lib/strings.js';

/**
 * menu entry for starting the tray application when Windows starts
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemStartWithWindows = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemStartWithWindows'].t,
        checked: true,
        sid: 'start_with_windows',
        enabled: true,
        init: function (checked) {
            // only run the code here if checked at launch
            checked && this.activate(checked);
        },
        activate: function (checked) {
            if (checked) {
                enableStartOnLaunch();
            } else {
                disableStartOnLaunch();
            }
        },
    };
};

export { itemStartWithWindows };
