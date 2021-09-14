import {
    enableStartOnLaunch,
    disableStartOnLaunch,
} from '../lib/autoStartManager';

/**
 * menu entry for starting the tray application when Windows starts
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemStartWithWindows = (props) => {
    return {
        title: 'Automatically Start With Windows',
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
