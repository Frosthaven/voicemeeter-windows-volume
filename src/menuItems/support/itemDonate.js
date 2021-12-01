import { systray } from '../../lib/persistantSysTray.js';
import { runPowershell } from '../../lib/runPowershell.js';
import { getSettings } from '../../lib/managers/settingsManager.js';
import { STRING_MENU_ITEMS } from '../../lib/strings.js';
/**
 * menu entry for launching the donation page in the default browser
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemDonate = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemDonate'].t,
        enabled: true,
        checked: false,
        button: true,
        init: () => {
            let settings = getSettings();
            let isDisabled = settings.disable_donate;

            if (isDisabled) {
                for (let [key, value] of systray.internalIdMap) {
                    if (value.title === STRING_MENU_ITEMS['itemDonate'].t) {
                        value.hidden = true;
                        systray.sendAction({
                            type: 'update-item',
                            item: value,
                        });
                    }
                }
            }
        },
        click: () => {
            runPowershell({
                stdout: false,
                commands: [
                    'Start-Process "https://www.paypal.com/donate?hosted_button_id=JBDM2H96RNKH8"',
                ],
                callback: () => {},
            });
        },
    };
};

export { itemDonate };
